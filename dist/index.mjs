#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';
import prompts from 'prompts';
import { cyan, yellow, blue, reset, red } from 'kolorist';

const FRAMEWORKS = [
  // {
  //   name: 'vue',
  //   display: 'Vue',
  //   color: green,
  //   variants: [
  //     {
  //       name: 'vue',
  //       display: 'JavaScript',
  //       color: yellow,
  //     },
  //     {
  //       name: 'vue-ts',
  //       display: 'TypeScript',
  //       color: blue,
  //     },
  //     {
  //       name: 'custom-create-vue',
  //       display: 'Customize with create-vue ↗',
  //       color: green,
  //       customCommand: 'npm create vue@latest TARGET_DIR',
  //     },
  //     {
  //       name: 'custom-nuxt',
  //       display: 'Nuxt ↗',
  //       color: lightGreen,
  //       customCommand: 'npm exec nuxi init TARGET_DIR',
  //     },
  //   ],
  // },
  {
    name: "react",
    display: "React",
    color: cyan,
    variants: [
      {
        name: "react",
        display: "JavaScript",
        color: yellow
      },
      {
        name: "react-ts",
        display: "TypeScript",
        color: blue
      },
      {
        name: "custom-reactcrud",
        display: "custom-reactcrud",
        color: yellow
      },
      {
        name: "react-swc",
        display: "JavaScript + SWC",
        color: blue
      },
      {
        name: "react-swc-ts",
        display: "TypeScript + SWC",
        color: yellow
      }
    ]
  }
];

const argv = minimist(process.argv.slice(2), { string: ["_"] });
const cwd = process.cwd();
const TEMPLATES = FRAMEWORKS.map(
  (f) => f.variants && f.variants.map((v) => v.name) || [f.name]
).reduce((a, b) => a.concat(b), []);
const renameFiles = {
  _gitignore: ".gitignore"
};
const defaultTargetDir = "react-project";
async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  let targetDir = argTargetDir || defaultTargetDir;
  let result;
  try {
    result = await prompts(
      [
        // 获取命令行传入的文件名，作为输出目录
        {
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: reset("\u5DE5\u7A0B\u540D\u79F0:"),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          }
        },
        // 当目录存在或者目录不为空，询问是否覆盖
        {
          type: () => !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
          name: "overwrite",
          message: () => (targetDir === "." ? "\u5F53\u524D\u76EE\u5F55" : `\u8F93\u51FA\u76EE\u5F55 "${targetDir}"`) + ` \u4E0D\u4E3A\u7A7A\uFF0C\u662F\u5426\u8986\u76D6\uFF08\u5E76\u5220\u9664\uFF09\u5DF2\u5B58\u5728\u76EE\u5F55\u4E0B\u6587\u4EF6?`
        },
        // 如果确认覆盖，输入Y(不是false)，输入N(false) 退出询问
        {
          type: (_, { overwrite: overwrite2 }) => {
            if (overwrite2 === false) {
              throw new Error(red("\u2716") + " \u62D2\u7EDD\u64CD\u4F5C\uFF0C\u9000\u51FA");
            }
            return null;
          },
          name: "overwriteChecker"
        },
        // 如果没有通过--t指定模板，需要询问用户选择预设模板
        {
          type: argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
          name: "framework",
          message: typeof argTemplate === "string" && !TEMPLATES.includes(argTemplate) ? reset(
            `"${argTemplate}" \u8FD9\u4E2A\u6846\u67B6\u4E0D\u6B63\u786E\uFF0C\u8BF7\u4ECE\u4E0B\u9762\u6846\u67B6\u4E2D\u9009\u62E9 `
          ) : reset("\u9009\u62E9\u5F00\u53D1\u6846\u67B6:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework2) => {
            const frameworkColor = framework2.color;
            return {
              title: frameworkColor(framework2.display || framework2.name),
              value: framework2
            };
          })
        },
        // 判断类型是否有其他类型，如template-ts,react-swc
        {
          type: (framework2) => framework2 && framework2.variants ? "select" : null,
          name: "variant",
          message: reset("\u9009\u62E9\u53D8\u79CD:"),
          choices: (framework2) => framework2.variants.map((variant2) => {
            const variantColor = variant2.color;
            return {
              title: variantColor(variant2.display || variant2.name),
              value: variant2.name
            };
          })
        }
      ],
      {
        onCancel: () => {
          throw new Error(red("\u2716") + " \u64CD\u4F5C\u88AB\u62D2\u7EDD\u4E86");
        }
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    return;
  }
  const { projectName, framework, overwrite, variant } = result;
  const root = path.join(cwd, targetDir);
  if (overwrite) {
    delExistsDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  let template = variant || framework?.name || argTemplate;
  let isReactSwc = false;
  if (template.includes("-swc")) {
    isReactSwc = true;
    template = template.replace("-swc", "");
  }
  console.log(`
\u5728${root}\u76EE\u5F55\u4E0B\u6B63\u5728\u751F\u6210\u811A\u624B\u67B6\u5DE5\u5177...`);
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `template-${template}`
  );
  const writeFileToTemplateDir = (file, content) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    writeFileToTemplateDir(file);
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );
  pkg.name = projectName;
  writeFileToTemplateDir("package.json", JSON.stringify(pkg, null, 2) + "\n");
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  if (isReactSwc) {
    setupReactSwc(root, template.endsWith("-ts"));
  }
  const cdProjectName = path.relative(cwd, root);
  console.log(`\u811A\u624B\u67B6\u751F\u6210\u6210\u529F\uFF0C\u73B0\u5728\u8FD0\u884C:
`);
  if (root !== cwd) {
    console.log(
      `  cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName}`
    );
  }
  switch (pkgManager) {
    case "yarn":
      console.log("  yarn");
      console.log("  yarn dev");
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }
  console.log();
}
init().catch((e) => {
  console.error(e);
});
function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/g, "");
}
function isEmpty(path2) {
  const files = fs.readdirSync(path2);
  return files.length === 0 || files.length === 1 && files[0] === ".git";
}
function delExistsDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}
function pkgFromUserAgent(userAgent) {
  if (!userAgent)
    return void 0;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1]
  };
}
function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}
function setupReactSwc(root, isTs) {
  editFile(path.resolve(root, "package.json"), (content) => {
    return content.replace(
      /"@vitejs\/plugin-react": ".+?"/,
      `"@vitejs/plugin-react-swc": "^3.0.0",
${"   "} "@swc/helpers": "^0.5.0"`
    );
  });
  editFile(
    path.resolve(root, `vite.config.${isTs ? "ts" : "js"}`),
    (content) => {
      return content.replace("@vitejs/plugin-react", "@vitejs/plugin-react-swc");
    }
  );
}
function editFile(file, callback) {
  const content = fs.readFileSync(file, "utf-8");
  fs.writeFileSync(file, callback(content), "utf-8");
}
