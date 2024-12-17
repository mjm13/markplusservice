import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { Task } from "../types";

export class Index extends OpenAPIRoute {
	schema = {
		tags: ["Index"],
		summary: "首页",
		responses: {
			"200": {
				description: "返回helloword",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								result:  Str(),
							}),
						}),
					},
				},
			},
			"404": {
				description: "Task not found",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								error: Str(),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c) {
		return {
			success: true,
			result: "helloword"
		};
	}
}
