// config.mjs or config.js (with "type": "module")
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Polyfill fetch and Headers for Node.js
import fetch, { Headers, Request, Response } from "node-fetch";
import FormData from 'form-data';

// Set global fetch, Headers, Request, Response
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.FormData = FormData;