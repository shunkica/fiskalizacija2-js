import https from "node:https";
import { URL } from "node:url";
import type { FiskalizacijaOptions } from "../types";

const defaultOptions: Partial<FiskalizacijaOptions> = {
    timeout: 30000
};

export async function postRequest(data: string, userOptions: FiskalizacijaOptions): Promise<{ statusCode: number; data: string }> {
    const options = { ...defaultOptions, ...userOptions };
    const url = new URL(options.service);

    const agentOptions: https.AgentOptions = {
        rejectUnauthorized: true
    };

    if (options.ca) {
        agentOptions.ca = options.ca;
    }

    const httpsAgent = new https.Agent(agentOptions);

    return new Promise((resolve, reject) => {
        const req = https.request(
            {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: "POST",
                headers: {
                    ...options.headers,
                    "Content-Length": Buffer.byteLength(data)
                },
                agent: httpsAgent,
                timeout: options.timeout
            },
            res => {
                let body = "";
                res.setEncoding("utf8");
                res.on("data", chunk => (body += chunk));
                res.on("end", () => {
                    resolve({
                        statusCode: res.statusCode ?? 0,
                        data: body
                    });
                });
            }
        );

        req.on("error", reject);
        req.on("timeout", () => {
            req.destroy(new Error("Request timed out"));
        });

        req.write(data);
        req.end();
    });
}
