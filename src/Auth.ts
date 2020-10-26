import fetch from 'node-fetch';

export type UserToken = string;
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  UNKNOWN = 'unknown',
}

export interface PushNotification {
  iconUrl: string;
  appName: string;
  message: string;
}

export default class Auth {
  private readonly projectId?: string;
  private readonly projectToken?: string;

  private userToken?: string;
  private tokenCallbacks: ((userToken: UserToken) => void)[] = [];

  constructor(projectId?: string, projectToken?: string) {
    this.projectId = projectId;
    this.projectToken = projectToken;

    // If we're in a frame, register listeners for async callbacks
    try {
      if (window && window.parent) {
        window.addEventListener('message', ({ data }) => {
          const { event } = data;
          if (event === 'KojiAuth.TokenCreated') {
            try {
              this.userToken = data.token;
              this.tokenCallbacks.forEach((callback) => {
                callback(data.userToken);
              });
              this.tokenCallbacks = [];
            } catch (err) {
              console.log(err);
            }
          }
        });
      }
    } catch (err) {}
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public/frontend methods
  //////////////////////////////////////////////////////////////////////////////

  // Ask Koji for a token identifying the current user, which can be used to
  // resolve the user's role
  public getToken(forceRefresh: boolean = false): Promise<UserToken> {
    return new Promise((resolve) => {
      this.getTokenWithCallback((token) => {
        resolve(token);
      }, forceRefresh);
    });
  }

  public getTokenWithCallback(
    callback: (userToken: UserToken) => void,
    forceRefresh: boolean = false,
  ) {
    if (this.userToken && !forceRefresh) {
      callback(this.userToken);
      return;
    }

    this.tokenCallbacks.push(callback);

    try {
      if (window && window.parent) {
        window.parent.postMessage({
          _kojiEventName: '@@koji/auth/getToken',
        }, '*');
      }
    } catch {}
  }

  //////////////////////////////////////////////////////////////////////////////
  // Backend/validation methods
  //////////////////////////////////////////////////////////////////////////////
  public async getRole(userToken: UserToken): Promise<UserRole> {
    try {
      const request = await fetch(
        this.buildUri('/v1/apps/auth/consumer/getRoleForToken'),
        {
          method: 'POST',
          headers: this.getHeaders(userToken) as any,
        },
      );
      const { role } = await request.json();
      return role;
    } catch (err) {
      return UserRole.UNKNOWN;
    }
  }

  // Push a notification to the owner of the pp
  public async pushNotificationToOwner(notification: PushNotification): Promise<void> {
    try {
      await fetch(
        this.buildUri('/v1/apps/auth/consumer/pushNotification'),
        {
          method: 'POST',
          headers: this.getHeaders() as any,
          body: JSON.stringify({
            notification,
          }),
        },
      );
    } catch (err) {
      //
    }
  }

  private getHeaders(userToken?: UserToken): {[index: string]: string|undefined} {
    const headers: {[index: string]: string|undefined} = {
      'Content-Type': 'application/json',
      'X-Koji-Project-Id': this.projectId,
      'X-Koji-Project-Token': this.projectToken,
    };

    if (userToken) {
      headers['X-Koji-Auth-Callback-Token'] = userToken;
    }
    return headers;
  }

  private buildUri(path: string, queryParams: {[index: string]: any} = {}): string {
    let base: string = `https://rest.api.gokoji.com${path}`;

    if (process.env.NODE_TEST) {
      base = `http://localhost:3129${path}`;
    }

    const resolvedParams = Object.keys(queryParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
      .join('&');
    if (resolvedParams) {
      base = `${base}?${resolvedParams}`;
    }

    return base;
  }
}
