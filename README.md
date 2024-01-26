<header align="center">
    <img alt='icarus logo' src="./public/images/icarus_logo.jpeg" width="50%" style="border-radius: 50%">

</header>

<h4 align="center">
  <a href="https://icarus-docs.netlify.app">Developer Documentation</a>
</h4>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Project Objective:](#project-objective)
- [Setup Project](#setup-project)
  - [Prerequisites](#prerequisites)
- [Install Project](#install-project)
- [Docker Image Deployment Guide](#docker-image-deployment-guide)
- [Developer Documentation](#developer-documentation)
- [Docker Image Deployment](#docker-image-deployment)
- [Contributors](#contributors)

## Project Objective:

The goal of this project is to develop a Node.js backend platform serving as a central integration point for various systems. The platform should be capable of creating a GraphQL API enabling comprehensive CRUD operations across integrated systems. Initially, emphasis will be placed on supporting both relational and non-relational databases. The architecture of the platform should be modular and extensible, allowing easy integration of additional services and APIs in the future.

## Setup Project

### Prerequisites

You need to install or make sure that these tools are pre-installed on your machine:

- [NodeJS](https://nodejs.org/en/download/): JavaScript runtime build.
- [Git](https://git-scm.com/): Open source version control system.
- [Docker](https://www.docker.com/): Platform for developing, shipping, and running applications in containers.
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html): Command-line interface for Amazon Web Services (AWS).
- [NPM](https://www.npmjs.com/package/npm) or [NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) (Node Version Manager): Package manager for Node.js (NPM) is used to install and manage Node.js packages, while NVM allows you to easily switch between different Node.js versions.

## Install Project

1. Clone the Repository

```bash
git clone https://github.com/Nessvah/ICARUS
```

1. Install packages in the `root` and `src/` directory

```
npm install
```

3. In the `src/` create a `.env` file and add the jwt secret and the port to run your server

```bash
JWT_SECRET=secret
PORT=portnumber

```

4. Run the server to start working locally

In the `src/` directory run:

```bash
npm start
```

## Docker Image Deployment Guide

To deploy your container to AWS ECR and run your API on a EC2, [click here](./docs/md/docker-ec2.md) to follow the instructions.

## Developer Documentation

[Check out our dedicated docs page for more technical documentation.](https://icarus-docs.netlify.app)

## Docker Image Deployment

## Contributors

- [Eliana Delgado](https://github.com/EssDelgado)
- [Pedro Maldonado](https://github.com/pedro-afm)
- [Sílvia Costa](https://github.com/Nessvah)
- [Susana Silva](https://github.com/Su401)
- [Willian Fischer](https://github.com/WillianFischer)

<p align="center">
<strong>Happy Coding</strong> ❤️
</p>
