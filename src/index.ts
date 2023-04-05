#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import prompts from "prompts";
import {
  red,
  reset,
} from 'kolorist'
import { FRAMEWORKS } from "./config";

/** 解析命令行传入的参数
node example/parse.js test1 test2 -a beep -b boop
# 输出 { _: [test1, test2], a: 'beep', b: 'boop' }
npx esno src/index.ts   
 输出 {_: []}
npx esno src/index.ts  --template react-ts
输出 {_: [], template: 'react-ts'}
npx esno src/index.ts  react-project/ --template react-ts
输出 {_: ['react-project/'], template: 'react-ts'}
*/
const argv = minimist<{
  t?: string;
  template?: string;
}>(process.argv.slice(2), { string: ["_"] });

// 项目绝对路径
const cwd = process.cwd();
/** [{...,variants: [{name,...}]}] => [[name，name2], [name3]] => [name, name2, name3]
[
  'react',
  'react-ts',
  'custom-reactcrud',
  'react-swc',
  'react-swc-ts'
]
*/
const TEMPLATES = FRAMEWORKS.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), []);
// 重命名，将模板目录下的_gitignore文件改为.gitignore，因为在复制文件时，permission denied，复制完成，在改写文件格式
const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
}

// 默认输出目录
const defaultTargetDir = "react-project";

async function init() {
  // 获取传入的第一个参数，作为输出目录,去除前后空格和末尾/线
  const argTargetDir = formatTargetDir(argv._[0]);
  // 获取通过 命令行--template或 --t 传入的模板
  const argTemplate = argv.template || argv.t;
  // 输出目录
  let targetDir = argTargetDir || defaultTargetDir;

  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    "projectName" | "overwrite" | "framework" | "variant"
  >;
  // 如果用户传入参数并且符合规则时 就不会进入询问
  try {
    result = await prompts(
      [
        // 获取命令行传入的文件名，作为输出目录
        {
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: reset("工程名称:"),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        // 当目录存在或者目录不为空，询问是否覆盖
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
          name: "overwrite",
          message: () =>
            (targetDir === "."
              ? "当前目录"
              : `输出目录 "${targetDir}"`) +
            ` 不为空，是否覆盖（并删除）已存在目录下文件?`,
        },
        // 如果确认覆盖，输入Y(不是false)，输入N(false) 退出询问
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(red("✖") + " 拒绝操作，退出");
            }
            return null;
          },
          name: "overwriteChecker",
        },
        // 如果没有通过--t指定模板，需要询问用户选择预设模板
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
          name: "framework",
          message:
            typeof argTemplate === "string" && !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" 这个框架不正确，请从下面框架中选择 `
                )
              : reset("选择开发框架:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
        // 判断类型是否有其他类型，如template-ts,react-swc
        {
          type: (framework: Framework) =>
            framework && framework.variants ? "select" : null,
          name: "variant",
          message: reset("选择变种:"),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.display || variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " 操作被拒绝了");
        },
      }
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }
  /**
   *  输出result
  {
  projectName: 'react-project',
  overwrite: true,
  framework: {
    name: 'react',
    display: 'React',
    color: [Function (anonymous)],
    variants: [ [Object], [Object], [Object], [Object], [Object] ]
  },
  variant: 'custom-reactcrud'
}
   */
  const { projectName,framework, overwrite, variant } = result
  const root = path.join(cwd, targetDir)
  // 覆盖已有目录 否则 创建空白目录
  if (overwrite) {
    delExistsDir(root)
  } else if(!fs.existsSync(root)){
    fs.mkdirSync(root, {recursive: true})
  }
  let template: string = variant || framework?.name || argTemplate
  // swc支持，目前只有在react中使用，作用类似babel，但是比babel快
  let isReactSwc = false
  if (template.includes('-swc')) {
    isReactSwc = true
    template = template.replace('-swc', '')
  }
  console.log(`\n在${root}目录下正在生成脚手架工具...`)
  // '/**/learnProject/create-vite/template-react-ts'
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    `template-${template}`,
  )
  // 
  const writeFileToTemplateDir = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
 
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }
  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    writeFileToTemplateDir(file)
  }

  //  更新package.json中的name属性
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
  )
  pkg.name = projectName
  writeFileToTemplateDir('package.json', JSON.stringify(pkg, null, 2) + '\n')
  // 获取npm版本信息
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'
  // 为react项目开启SWC支持
  if (isReactSwc) {
    setupReactSwc(root, template.endsWith('-ts'))
  }
  // 脚手架生成成功，打印提示信息
  const cdProjectName = path.relative(cwd, root)
  console.log(`\脚手架生成成功，现在运行:\n`)
  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
      }`,
    )
  }
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      console.log(`  ${pkgManager} run dev`)
      break
  }
  console.log()

}

init().catch((e) => {
  console.error(e);
});

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}
// 目录是否为空，文件数为0，或则只有.git文件
function isEmpty(path: string) {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}
// 清空目录，如果只有.git 不处理
function delExistsDir (dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    // 递归删除文件夹，相当于rm -rf xxx
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}
// 通过 process.env.npm_config_user_agent 获取到当前运行脚本的包管理器和版本号
function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}
// 复制文件和文件夹
function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}
// 复制文件夹
function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}
// 为react项目开启SWC支持
function setupReactSwc(root: string, isTs: boolean) {
  /**
   * 修改package.json
   * 将依赖 "@vitejs/plugin-react": "^3.1.0",
   * 修改为 "@vitejs/plugin-react-swc": "^3.0.0",
   */
  editFile(path.resolve(root, 'package.json'), (content) => {
    return content.replace(
      /"@vitejs\/plugin-react": ".+?"/,
      `"@vitejs/plugin-react-swc": "^3.0.0",\n${'   '} "@swc/helpers": "^0.5.0"`,
    )
  })
  /**
   * vite.config.ts|js
   * 将引用 import react from '@vitejs/plugin-react'
   * 修改为 import react from '@vitejs/plugin-react-swc'
   */
  editFile(
    path.resolve(root, `vite.config.${isTs ? 'ts' : 'js'}`),
    (content) => {
      return content.replace('@vitejs/plugin-react', '@vitejs/plugin-react-swc')
    },
  )
}

function editFile(file: string, callback: (content: string) => string) {
  const content = fs.readFileSync(file, 'utf-8')
  fs.writeFileSync(file, callback(content), 'utf-8')
}