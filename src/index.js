import { Hono } from "hono";
import { jwt, sign } from 'hono/jwt'
import { cors } from 'hono/cors'

const app = new Hono();
const secret = 'my_very_strong_secret_key';

app.use('/*', cors({ origin: "*" }));

// 登录接口
app.get('/login', async (c) => {
    const username = c.req.query('username') || 'anonymous';
    const pwd = c.req.query('pwd') || 'anonymous';
    if (username != 'mjm' && pwd != 'asdf!@#$1234') {
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
        if (payload.sub != 'mjm') {
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
    var success = true;
    var message = 'Bookmarks saved successfully';
    try {
        console.log("正在接收请求的 JSON 数据...");
        // 获取原始请求体数据
        const rawData = await c.req.text();
        // 解析 JSON 数据
        const bookmarks = JSON.parse(rawData);
        console.log("接收到的书签数量:", bookmarks.length);
        const stmt = c.env.DB.prepare(`INSERT OR REPLACE INTO  bookmarks (
                id, parentId, title, url, currentDomain, currentUrl, dateGroupModified, 
                dateAdded, \`index\`, treeId, treeName, domain, tags, domainTitle, metaTitle,
                metaKeywords, metaDescription, metaTags, syncChrome, type, childrenCount, 
                status, dateAddedTime, dateGroupModifiedTime
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?, ?)`);
        var params = [];
        for (const bookmark of bookmarks) {
            const {
                id, parentId, title, url, currentDomain, currentUrl, dateGroupModified,
                dateAdded, index, treeId, treeName, domain, tags, domainTitle, metaTitle,
                metaKeywords, metaDescription, metaTags, syncChrome, type, childrenCount,
                status, dateAddedTime, dateGroupModifiedTime
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
        console.log("准备执行批量插入操作...");
        await c.env.DB.batch(params);
    } catch (error) {
        console.error("处理请求时发生错误:", error);
        success = false;
        message = 'Failed to save bookmarks';
    }
    return c.json({
        success,
        message
    });
});

// 创建任务
app.post('/crawl-meta', authMiddleware, async (c) => {
    const bookmark = await c.req.json();
    
    return c.json({
        success: true,
        bookmark
    });
});

export default app;
