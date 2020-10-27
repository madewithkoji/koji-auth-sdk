# Koji Auth SDK

**User authentication for Koji templates.**

## Overview

The @withkoji/auth package enables you to authenticate users in Koji templates. Today, this is limited to determining the user's role (i.e., whether or not the user is the owner of the Koji) and cannot be used to determine anything else about a user.

## Installation

Install the package in the frontend and backend services of your Koji project.

```
npm install --save @withkoji/auth
```

## Basic use

Instantiate `Auth` on the frontend.

```
import Auth from '@withkoji/auth';
const auth = new Auth();
```

Get the user's short-lived callback token and include it with a request to some kind of admin route

```
const token = await auth.getToken();

fetch('/backend/some/admin/route', {
  method: 'GET',
  headers: {
    authorization: token,
  },
});

```

Instantiate `Auth` on the backend and use it to verify the user's role
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

## Contributions and questions

See the [contributions page](https://developer.withkoji.com/docs/about/contribute-koji-developers) on the developer site for info on how to make contributions to Koji repositories and developer documentation.

For any questions, reach out to the developer community or the `@Koji Team` on our [Discord server](https://discord.gg/eQuMJF6).
