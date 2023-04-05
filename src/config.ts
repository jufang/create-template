import {
  blue,
  cyan,
  yellow
} from 'kolorist'

export type ColorFunc = (str: string | number) => string
export type Framework = {
  name: string
  display: string
  color: ColorFunc
  variants: FrameworkVariant[]
}
export type FrameworkVariant = {
  name: string
  display: string
  color: ColorFunc
}
// 只是用来学习用的  具体还是使用create-vite创建
export const FRAMEWORKS: Framework[] = [
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
    name: 'react',
    display: 'React',
    color: cyan,
    variants: [
      {
        name: 'react',
        display: 'JavaScript',
        color: yellow,
      },
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: blue,
      },
      {
        name: 'custom-reactcrud',
        display: 'custom-reactcrud',
        color: yellow,
      },
      // swc 启动有问题，暂时注释掉
      // {
      //   name: 'react-swc',
      //   display: 'JavaScript + SWC',
      //   color: blue,
      // },
      // {
      //   name: 'react-swc-ts',
      //   display: 'TypeScript + SWC',
      //   color: yellow,
      // },
    ],
  },
]