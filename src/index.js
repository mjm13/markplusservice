import { Hono } from "hono";
import { jwt, sign } from 'hono/jwt'

const app = new Hono();
const secret = 'my_very_strong_secret_key';

// 登录接口
app.get('/login', async (c) => {
    const username = c.req.query('username') || 'anonymous';
    const pwd = c.req.query('pwd') || 'anonymous';
    if(username != 'mjm' && pwd!='asdf!@#$1234'){
        return c.json({ error: 'Invalid user' }, 401);
    }
    const payload = { sub: username, role: 'admin' };
    const token = await sign(payload, secret);
    return c.json({ token });
});

// JWT 中间件
const jwtMiddleware = jwt({ secret });

// 受保护的路由中间件
const authMiddleware = async (c, next) => {
    try {
        const payload = await jwtMiddleware(c, next);
        console.log(payload);
        if(payload.sub != 'mjm'){
            return c.json({ error: 'Unauthorized' }, 401);
        }
    } catch (error) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
};

// API 路由
app.get('/test', authMiddleware, async (c) => {
    return c.json({
        success: true,
        result: "connection sucess"
    });
});

// 任务列表
app.get('/api/tasks', authMiddleware, async (c) => {
    const page = parseInt(c.req.query('page')) || 0;
    const isCompleted = c.req.query('isCompleted') === 'true';

    return c.json({
        success: true,
        tasks: [
            {
                name: "Clean my room",
                slug: "clean-room",
                description: null,
                completed: false,
                due_date: "2025-01-05",
            },
            {
                name: "Build something awesome with Cloudflare Workers",
                slug: "cloudflare-workers",
                description: "Lorem Ipsum",
                completed: true,
                due_date: "2022-12-24",
            },
        ],
    });
});

// 创建任务
app.post('/api/tasks', authMiddleware, async (c) => {
    const body = await c.req.json();

    return c.json({
        success: true,
        task: {
            name: body.name,
            slug: body.slug,
            description: body.description,
            completed: body.completed || false,
            due_date: body.due_date,
        },
    });
});

// 获取单个任务
app.get('/api/tasks/:taskSlug', authMiddleware, async (c) => {
    const taskSlug = c.req.param('taskSlug');

    return c.json({
        success: true,
        task: {
            name: "my task",
            slug: taskSlug,
            description: "this needs to be done",
            completed: false,
            due_date: new Date().toISOString().slice(0, 10),
        },
    });
});

export default app;
