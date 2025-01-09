// 获取DOM元素
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// 用户头像SVG
const userAvatarSvg = `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="12" fill="white"/>
        <path d="M20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8ZM20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12Z" fill="url(#paint1_linear)"/>
        <defs>
            <linearGradient id="paint1_linear" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FF6B6B"/>
                <stop offset="1" stop-color="#FF8E8E"/>
            </linearGradient>
        </defs>
    </svg>
`;

// AI头像SVG
const aiAvatarSvg = `
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="12" fill="white"/>
        <path d="M20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8ZM20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12Z" fill="url(#paint0_linear)"/>
        <defs>
            <linearGradient id="paint0_linear" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6C8EEF"/>
                <stop offset="1" stop-color="#4C6EF5"/>
            </linearGradient>
        </defs>
    </svg>
`;

// 自动调整文本框高度
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});

// 添加消息到界面
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.innerHTML = role === 'user' ? userAvatarSvg : aiAvatarSvg;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // 使用 requestAnimationFrame 确保在DOM更新后滚动
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}

// 处理发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 添加用户消息到界面
    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    // 禁用输入和发送按钮
    userInput.disabled = true;
    sendButton.disabled = true;

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-4c7e514a154a4022a6d4fb8ce21a799c'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {role: 'system', content: 'You are a helpful assistant.'},
                    {role: 'user', content: message}
                ],
                stream: false
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            addMessage(data.choices[0].message.content, 'assistant');
        } else {
            throw new Error('Invalid response from API');
        }
    } catch (error) {
        addMessage('抱歉，发生了一些错误，请稍后重试。', 'assistant');
        console.error('Error:', error);
    }

    // 重新启用输入和发送按钮
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
}

// 事件监听器
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 功能按钮切换
document.querySelectorAll('.function-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.function-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 新对话按钮
document.querySelector('.new-chat-btn').addEventListener('click', () => {
    chatContainer.innerHTML = '';
    const welcomeMessage = `你好！我是 NY，很高兴见到你！✨

我可以成为你的AI助手，帮你处理各种任务：
• 编写和审查代码
• 回答问题和解决问题
• 创作文章和内容
• 分析数据和生成报告

让我们开始吧！请告诉我你需要什么帮助。`;
    addMessage(welcomeMessage, 'assistant');
});