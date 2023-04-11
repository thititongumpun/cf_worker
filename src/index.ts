/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { GeoApiResponse } from "./types/type";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  API_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env) {
    let endpoint = "https://api.waqi.info/feed/geo:";
    const token = env.API_TOKEN;
    let html_style = `body{padding:6em; font-family: sans-serif;} h1{color:#f6821f}`;

    let html_content = "<h1>Weather 🌦</h1>";

    const latitude = request?.cf?.latitude;
    const longitude = request?.cf?.longitude;
    endpoint += `${latitude};${longitude}/?token=${token}`;
    const init = {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    };

    const response = await fetch(endpoint, init);
    const content: GeoApiResponse = await response.json();

    html_content += `<p>This is a demo using Workers geolocation data. </p>`;
    html_content += `You are located at: ${latitude},${longitude}.</p>`;
    html_content += `<p>Based off sensor data from <a href="${content.data.city.url}">${content.data.city.name}</a>:</p>`;
    html_content += `<p>The AQI level is: ${content.data.aqi}.</p>`;
    html_content += `<p>The N02 level is: ${content.data.iaqi.no2?.v}.</p>`;
    html_content += `<p>The O3 level is: ${content.data.iaqi.o3?.v}.</p>`;
    html_content += `<p>The temperature is: ${content.data.iaqi.t?.v}°C.</p>`;
    html_content += `<p>The PM2.5 is: ${content.data.iaqi.pm25.v}.</p>`;
    html_content += `<p>Time is: ${content.data.time.iso}.</p>`;

    let html = `
      <!DOCTYPE html>
      <head>
        <title>Geolocation: Weather</title>
      </head>
      <body>
        <style>${html_style}</style>
        <div id="container">
        ${html_content}
        </div>
      </body>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};
