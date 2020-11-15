# Koji Auth SDK
![npm (scoped)](https://img.shields.io/npm/v/@withkoji/auth?color=green&style=flat-square)

**User authentication for Koji templates.**

## Overview

The @withkoji/auth package enables you to authenticate users in Koji templates. This package provides methods for determining the current user’s role (whether or not the user created the Koji). It also enables the template to send notifications to the creator’s Koji account.

## Installation

Install the package in the frontend and backend services of your Koji project.

```
npm install --save @withkoji/auth
```

**NOTE:** To support instant remixes of your template, you must also install the [@withkoji/vcc package](https://developer.withkoji.com/reference/packages/withkoji-vcc-package) and implement the `VccMiddleware` on your backend server. This middleware maintains the environment variables for instant remixes, ensuring that user authentication applies to the correct remix version.

## Basic use

Instantiate `Auth` on the frontend.

```
import Auth from '@withkoji/auth';
const auth = new Auth();
```

Get the user's short-lived callback token and include it with a request to an appropriate backend route.

```
const token = await auth.getToken();

fetch('/backend/some/admin/route', {
  method: 'GET',
  headers: {
    authorization: token,
  },
});

```

Instantiate `Auth` on the backend and use it to verify the user's role.
```
import Auth from '@withkoji/auth';

app.get('/backend/some/admin/route', async (req, res) => {
  const auth = new Auth(
    res.locals.KOJI_PROJECT_ID,
    res.locals.KOJI_PROJECT_TOKEN,
  );

  const role = await auth.getRole(req.headers.authorization);
  if (role !== 'admin') {
    res.sendStatus(401);
    return;
  }

  // access granted
});
```

## Related resources

* [Package documentation](https://developer.withkoji.com/reference/packages/withkoji-koji-auth-sdk)
* [Koji homepage](http://withkoji.com/)

## Contributions and questions

See the [contributions page](https://developer.withkoji.com/docs/about/contribute-koji-developers) on the developer site for info on how to make contributions to Koji repositories and developer documentation.

For any questions, reach out to the developer community or the `@Koji Team` on our [Discord server](https://discord.gg/eQuMJF6).
