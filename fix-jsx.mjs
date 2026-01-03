import fs from 'fs';

const filePath = 'lib/index.js';
let content = fs.readFileSync(filePath, 'utf8');

// 如果已经修复过，跳过
if (!content.includes('require("@satorijs/element/jsx-runtime")')) {
    console.log('Already fixed or no jsx-runtime require found');
    process.exit(0);
}

// 移除 require 语句
content = content.replace(/const jsx_runtime_1 = require\("@satorijs\/element\/jsx-runtime"\);?/g, '');

// 添加动态导入
const importCode = `let jsx_runtime_1_promise = import("@satorijs/element/jsx-runtime");
let jsx_runtime_1;
jsx_runtime_1_promise.then(mod => {
    jsx_runtime_1 = mod.default || mod;
});
`;

content = content.replace(
    /("use strict";\nObject\.defineProperty\(exports, "__esModule", \{ value: true \}\);)/,
    `$1\n${importCode}`
);

// 修复 eula 方法中的导入等待
content = content.replace(
    /(async eula\(argv\) \{[\s\S]*?)(if \(!jsx_runtime_1\) \{[\s\S]*?jsx_runtime_1 = await jsx_runtime_1_promise;[\s\S]*?\})/,
    (match, prefix, oldIf) => {
        return prefix + `const mod = await jsx_runtime_1_promise;
            jsx_runtime_1 = mod.default || mod;`;
    }
);

// 确保在 eula 方法开始时等待导入
if (!content.includes('const mod = await jsx_runtime_1_promise')) {
    content = content.replace(
        /(async eula\(argv\) \{)/,
        `$1
        if (!jsx_runtime_1) {
            const mod = await jsx_runtime_1_promise;
            jsx_runtime_1 = mod.default || mod;
        }`
    );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed jsx-runtime import in lib/index.js');
