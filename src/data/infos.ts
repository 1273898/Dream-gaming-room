/** 各可交互物品的点缀色 */
export const ACCENT = {
  pc: '#22d3ee',
  monitor: '#7cc4ff',
  tv: '#34d399',
  gamepad: '#fb923c',
  keyboard: '#e879f9',
  mouse: '#c084fc',
  lamp: '#fbbf24',
  fridge: '#93c5fd',
  book: '#f472b6',
} as const

/** 点击物品后顶部展示的文字 */
export const INFOS: Record<string, { title: string; text: string }> = {
  pc: {
    title: 'PC 主机',
    text: '一直想攒一台属于自己的主机：不用顶配，但每个零件都是自己挑的。侧透亮起的那一刻，游戏房才算真正开始。',
  },
  monitor: {
    title: '显示器',
    text: '一块好屏幕是陪伴时间最长的设备——27 寸 2K 高刷，写代码、打游戏、看片都靠它。点一下，屏幕就亮了。',
  },
  keyboard: {
    title: '机械键盘',
    text: '青轴的段落感会上瘾。RGB 灯流起来之后，哪怕只是打字也像在操作什么了不起的装备。',
  },
  mouse: {
    title: '鼠标',
    text: '轻量化小手鼠，指向即直觉。点一下，它会轻轻回你一下——像握手。',
  },
  speaker: {
    title: '桌面音响',
    text: '左右声道各一只，体积不大但足够把整个房间填满 BGM。',
  },
  tv: {
    title: '主机游戏站',
    text: '游戏房的灵魂区域：一整面墙的超大电视，窝在沙发里打主机游戏。周末的晚上，这里就是全世界。',
  },
  gamepad: {
    title: '手柄',
    text: '最喜欢的外设没有之一。扳机的震动、摇杆的阻尼，好的手柄让游戏多一层触感。想收集一排限定配色。',
  },
  chair: {
    title: '电竞椅',
    text: '一把能窝一整天的椅子。转一圈，回到战场。',
  },
  bookshelf: {
    title: '书架',
    text: '上面摆满了轻小说和漫画——从《凉宫春日》到《葬送的芙莉莲》，每一本都是一段熬夜的证据。',
  },
  sofa: {
    title: '小沙发',
    text: '正对着超大电视的专座。陷进去就不想起来，手柄都够得着。',
  },
  curtain: {
    title: '窗帘',
    text: '白天拉开晒太阳，晚上拉上隔绝世界。',
  },
  switch: {
    title: '电灯开关',
    text: '啪嗒一声，白天和黑夜在这里交接。',
  },
  fridge: {
    title: '冰箱',
    text: '游戏房的补给站：冰镇可乐和快乐水常备。打游戏手边没有冰饮，总觉得少了点什么。',
  },
  snack: {
    title: '零食柜',
    text: '薯片、巧克力、干脆面……抽屉拉开的声音就是深夜游戏的开场白。',
  },
  cloudLamp: {
    title: '雷云灯',
    text: '一朵会打雷的云。深夜亮起来的时候，房间就有了自己的天气。',
  },
  cat: {
    title: '小猫',
    text: '喵～房间真正的主人。它随意走动的路线，就是这间屋子的心跳。',
  },
  poster: {
    title: '海报墙',
    text: '喜欢的东西都贴在这里。一个位置能放好几张，点一下就换下一张。',
  },
}
