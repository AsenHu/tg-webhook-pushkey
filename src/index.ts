import sha256 from 'crypto-js/sha256';

interface Env {
    baseAPI: string;
    token: string;
}

interface TGjson {
    message: {
        chat: {
            id: string;
        };
        text: string;
    };
}

export default {
    async fetch(request: Request, env: Env) {
        // 读取请求
        const tgjson: TGjson = await request.json();

        // 准备端点
        const API = `${env.baseAPI}sendMessage`;

        // 提取消息
        const text = tgjson.message.text;

        // 如果消息是 /start
        if (text === '/start') {
            // 提取 chatid 准备 pushkey
            const chatid = tgjson.message.chat.id;
            const signature = sha256(chatid + env.token).toString();
            const pushkey = chatid + ':' + signature;
            const send = `你的 pushkey 是\n\`${pushkey}\`\n\npushkey 暂时被设计成通过 chatid 计算得到的，因此即使泄漏也*无法停用*\n请妥善保管\n\n不过如果真的有人泄漏了应该会改成可以停用的`;

            const payload = {
                parse_mode: 'MarkdownV2',
                chat_id: chatid,
                text: send,
            };
            const init = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            };
            // 发送消息
            await fetch(API, init);
        }

        // 结束
        return new Response(null);
    },
};