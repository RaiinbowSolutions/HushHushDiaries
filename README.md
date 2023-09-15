# HushHushDiaries

[![Build](https://img.shields.io/netlify/23e0f6c8-5e0b-4305-aa29-2360cb999b09?style=for-the-badge&logo=netlify&logoColor=#00C7B7)](https://hush-hush-diaries.netlify.app)
[![Version](https://img.shields.io/github/package-json/v/RaiinbowSolutions/HushHushDiaries?style=for-the-badge)](package.json)
[![License](https://img.shields.io/github/license/RaiinbowSolutions/HushHushDiaries?style=for-the-badge)](LICENSE)

## Index

- [1. Introduction](#1-introduction)
- [2. Documentations](#2-documentations)
    - [2.1. Idea Description](#21-idea-description)
    - [2.2. Problem Description](#22-problem-description)
    - [2.3. Requirements Documentation](#23-requirements-documentation)
    - [2.4. Product Documentation](#24-product-documentation)
    - [2.5. Process Documentation](#25-process-documentation)
- [3. Development](#3-development)
    - [3.1. Requirements](#31-requirements)
    - [3.2. Setup](#32-setup)
    - [3.3. Run](#33-run)
    - [3.4. Packages used](#34-packages-used)

## 1. Introduction

The online forum, Hush Hush Diaries, is a place where it is possible for people with interests and social challenges to interact anonymously and safely.

## 2. Documentations

### 2.1. Idea Description

In progress of being developed.

### 2.2. Problem Description

In progress of being developed.

### 2.3. Requirements Documentation

In progress of being developed.

### 2.4. Product Documentation

In progress of being developed.

### 2.5. Process Documentation

In progress of being developed.

## 3. Development

### 3.1. Requirements

[![node](https://img.shields.io/badge/node-%5E16.0.0-informational?style=flat-square)](https://nodejs.org/en/)
[![netlify-cli](https://img.shields.io/badge/netlify--cli-%5E11.5.1-informational?style=flat-square)](https://www.npmjs.com/package/netlify-cli)

These things are required to run the development environment.

- node.js v16.0.0
- netlify-cli v11.5.1

### 3.2. Setup

1. Clone project from Github.
2. `npm install -g npm` to update to latest version of npm.
3. `npm install -g netlify-cli` to install the local runtime environment.
4. `npm install` to install dependencies.
5. `netlify env:import .env` to fetch environment configurations.

### 3.2.1 How to link to Netlify.

1. `netlify link` to form a link (id from netlify site configuration)

### 3.3. Run

1. `netlify dev --filter hushhushdiaries-api` to run the local runtime environment.

### 3.4. Packages used

**Packages:**

[![cross-env](https://img.shields.io/badge/cross--env-%5E7.0.3-informational?style=flat-square)](https://www.npmjs.com/package/cross-env)
[![npm-run-all](https://img.shields.io/badge/npm--run--all-%5E4.1.5-informational?style=flat-square)](https://www.npmjs.com/package/npm-run-all)

These packages are used in the main project.

- cross-env v7.0.3
- npm-run-all v4.1.5

**API packages:**

[![typescript](https://img.shields.io/badge/typescript-%5E5.1.6-informational?style=flat-square)](https://www.npmjs.com/package/typescript)
[![aws-lambda](https://img.shields.io/badge/aws--lambda-%5E1.0.7-informational?style=flat-square)](https://www.npmjs.com/package/aws-lambda)
[![dotenv](https://img.shields.io/badge/dotenv-%5E16.3.1-informational?style=flat-square)](https://www.npmjs.com/package/dotenv)
[![hashids](https://img.shields.io/badge/hashids-%5E2.3.0-informational?style=flat-square)](https://www.npmjs.com/package/hashids)
[![kysely](https://img.shields.io/badge/kysely-%5E0.26.1-informational?style=flat-square)](https://www.npmjs.com/package/kysely)
[![kysely-planetscale](https://img.shields.io/badge/kysely--planetscale-%5E1.4.0-informational?style=flat-square)](https://www.npmjs.com/package/kysely-planetscale)
[![lambda-api](https://img.shields.io/badge/lambda--api-%5E1.0.3-informational?style=flat-square)](https://www.npmjs.com/package/lambda-api)

These packages are used in the api project.

- typescript v5.1.6
- aws-lambda v1.0.7
- dotenv v16.3.1
- hashids v2.3.0
- kysely v0.36.1
- kysely-planetscale v1.4.0
- lambda-api v1.0.3

**Website packages:**

[![anguler](https://img.shields.io/badge/angular-16.2.0-informational?style=flat-square)](https://www.npmjs.com/package/angular)
[![jwt-decode](https://img.shields.io/badge/jwt--decode-3.1.2-informational?style=flat-square)](https://www.npmjs.com/package/jwt-decode)

These packages are used in the website project.

- angular v16.2.0
- jwt-decode v3.1.2