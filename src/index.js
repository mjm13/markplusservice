import { Hono } from "hono";
import { jwt, sign } from 'hono/jwt'
import { cors } from 'hono/cors'

const app = new Hono();
const secret = 'my_very_strong_secret_key';

app.use('/*', cors({origin:"*"}));

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
app.post('/savebookmarks', authMiddleware, async (c) => {
    const bookmarks  = await c.req.json();

    const stmt = env.DB.prepare(`INSERT INTO bookmarks (
                id, parentId, title, url, currentDomain, currentUrl,
                dateAdded, dateGroupModified, index, treeld, treeName, domain, tag,
                domainTitle, metaTitle, metaDescription, metaKeywords, metaImage,
                childrenCount, status, dateAddedTime, dateGroupModifiedTime
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    var params = [];         
    for (const bookmark of bookmarks) {
        const {
            id,parentId,title,url,currentDomain,currentUrl,dateGroupModified,dateAdded,
            index,treeId,treeName,domain,tags,domainTitle,metaTitle,metaKeywords,metaDescription,
            metaTags,syncChrome,type,childrenCount,status,dateAddedTime,dateGroupModifiedTime
        } = bookmark;

        params.push(stmt.bind(id,
            parentId || '',
            title || '',
            url || '',
            currentDomain || '',
            currentUrl || '',
            dateGroupModified || '',
            dateAdded || '',
            index || 0,
            treeId || '',
            treeName || '',
            domain || '',
            tags || '[]',
            domainTitle || '',
            metaTitle || '',
            metaKeywords || '',
            metaDescription || '',
            metaTags || '',
            syncChrome || false,
            type || '',
            childrenCount || 0,
            status || 0,
            dateAddedTime || '',
            dateGroupModifiedTime || ''));
    }
    const results = await env.DB.batch(params);

    return c.json({
        success: true,
        message: 'Bookmarks saved successfully',
        results: results
    });
});

// 创建任务
app.post('/testparam', authMiddleware, async (c) => {
    const body = await c.req.json();
    body['test'] = 'in markplusservice';
    return c.json({
        success: true,
        body
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
