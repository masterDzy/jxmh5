/**
 * 调试用本地数据库 (PGlite) 入口
 *
 * 用法:
 *  1. 用户在 profile 页打开"本地调试模式"开关
 *  2. 重启 APP
 *  3. 之后所有 /api/v1/* 请求会被 http.ts 拦截,改走 PGlite
 *
 * 一键回退: profile 页关掉开关 → 重启 → 走真后端
 */

export { isLocalMode, routeLocalApi, type LocalRequest, type LocalResponse } from './router'
export { resetLocalDB } from '../local-db'
