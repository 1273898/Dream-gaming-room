# 访客留言板设计

日期：2026-08-19

## 需求

- 访客进入场景 10 秒后自动弹出留言弹窗（每次页面加载只弹一次）
- 弹窗内可留下一句话（必填，≤50 字）和 ID（选填，≤12 字，缺省显示「匿名访客」）
- 弹窗内直接展示最近 20 条留言（ID + 内容 + 时间）
- 所有访客共享同一份留言数据

## 存储：Supabase（REST 直连）

项目是纯静态站点，留言共享需要云端数据库。选用 Supabase，**不引入官方 SDK**，
直接用 `fetch` 调 PostgREST（`/rest/v1/messages`），零新增依赖，控制包体积。

### 数据表（用户在 Supabase SQL Editor 执行）

```sql
create table public.messages (
  id bigint generated always as identity primary key,
  nickname text,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "anyone can read messages"
on public.messages for select using (true);

create policy "anyone can insert short messages"
on public.messages for insert with check (
  char_length(btrim(content)) between 1 and 50
  and (nickname is null or char_length(btrim(nickname)) between 1 and 12)
);
```

RLS 在数据库层强制长度约束：即使绕过前端直接调 API，超长/空白内容也写不进去。
任何人只能读和新增，无法改删。

### 密钥

- 使用 publishable key（`sb_publishable_...`，为前端公开设计，受 RLS 限制）
- 存于 `.env.local`（已被 .gitignore 的 `.env.*` 覆盖，不进仓库）：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Vercel 部署时在项目环境变量配置同名变量
- key 未配置时留言模块静默不加载（`guestbookEnabled = false`），不影响房间

## 文件结构

| 文件 | 职责 |
|---|---|
| `src/guestbook/guestbook.ts` | REST 客户端：`fetchMessages()` / `postMessage()` / `guestbookEnabled` |
| `src/ui/GuestbookModal.tsx` | 弹窗组件（表单 + 留言列表） |
| `src/index.css` | 追加 `.guestbook-*` 样式 |
| `src/App.tsx` | 挂载弹窗 + 10 秒定时器 |

## 弹窗行为

- App 挂载后 `setTimeout(10000)` 触发打开；关闭后本次访问不再自动弹出（刷新重置）
- 关闭途径：× 按钮 / 点击遮罩 / Esc
- 遮罩盖住 canvas，打开期间场景不可交互
- 提交成功：新留言插入列表顶部，按钮变「已留下足迹 ✓」，1.5 秒后自动关闭
- 提交失败：显示「提交失败，请再试一次」，可重试
- 列表加载中/失败/为空各有占位提示（「还没有留言，来抢沙发」）

## 样式

沿用现有设计语言（参照 `.stereo-console`）：

- 白天：白底卡片、1.5px `#1a1a1a` 描边、16px 圆角、底部滑入动效（`cubic-bezier(0.22,1,0.36,1)`）
- 夜间（`.night`）：暗底 `rgba(18,18,32,0.94)`、`#7ef9ff` 荧光描边 + 紫青双色外发光
- 留言者 ID 用主题紫（`ACCENT.keyboard` 同款 `#e879f9`）

## 防滥用

- 数据库 CHECK 约束兜底长度（见上）
- 前端提交前 trim 校验、提交中禁用按钮防连点
- 更深层的限流（验证码等）超出本期范围，免费额度对纯文本留言足够

## 验证

- 浏览器实测：弹窗 10 秒自动出现、提交后列表即时更新、关闭后不再弹、夜间样式正确
- 构建通过（`npm run build`）
