import type { Task, PromptTemplate } from '../types';

// 蔡司任务清单
export const zeissTasks: Task[] = [
  // Part 1: 瞳距偏差 - 棱镜效应
  {
    id: 'pd-1',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '视疲劳情景图',
    description: '人物1，眼镜偏右，表情难受，揉眼睛或扶额',
    status: 'pending',
    thumbnails: [],
  },
  {
    id: 'pd-2',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '聚焦困难情景图',
    description: '人物看书或手机时眯眼，表情困惑',
    status: 'pending',
    thumbnails: [],
  },
  {
    id: 'pd-3',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '走路不稳情景图',
    description: '人物走路时扶墙或踉跄，表情不适',
    status: 'pending',
    thumbnails: [],
  },

  // Part 2: 装配高度偏差 - 渐进镜片
  {
    id: 'fh-1',
    part: 'fitting-height',
    partName: '装配高度偏差',
    title: '装配高度偏高',
    description: '人物2，白发，看远处模糊，抬头眯眼',
    status: 'pending',
    thumbnails: [],
  },
  {
    id: 'fh-2',
    part: 'fitting-height',
    partName: '装配高度偏差',
    title: '装配高度偏低',
    description: '人物看近处吃力，低头费劲，表情疲惫',
    status: 'pending',
    thumbnails: [],
  },

  // Part 3: 镜眼距偏差
  {
    id: 'vd-1',
    part: 'vertex-distance',
    partName: '镜眼距偏差',
    title: '镜眼距过近',
    description: '睫毛刷到镜片，眨眼不适',
    status: 'pending',
    thumbnails: [],
  },
  {
    id: 'vd-2',
    part: 'vertex-distance',
    partName: '镜眼距偏差',
    title: '镜眼距过远',
    description: '管状视野效果，周边模糊',
    status: 'pending',
    thumbnails: [],
  },

  // Part 4: 倾斜角偏差
  {
    id: 'pt-1',
    part: 'pantoscopic-tilt',
    partName: '倾斜角偏差',
    title: '倾斜角过小',
    description: '视野边缘发虚，看东西不清晰',
    status: 'pending',
    thumbnails: [],
  },
  {
    id: 'pt-2',
    part: 'pantoscopic-tilt',
    partName: '倾斜角偏差',
    title: '倾斜角过大',
    description: '镜片下缘触碰脸颊，不舒适',
    status: 'pending',
    thumbnails: [],
  },

  // Part 5: 镜面角偏差
  {
    id: 'ff-1',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '周边视力模糊',
    description: '侧面看东西模糊，需要转头',
    status: 'pending',
    thumbnails: [],
  },
  {
    id: 'ff-2',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '头晕恶心',
    description: '佩戴眼镜后头晕，表情痛苦',
    status: 'pending',
    thumbnails: [],
  },
];

// 默认提示词模板
export const defaultTemplates: PromptTemplate[] = [
  {
    id: 'tpl-general',
    name: '通用人物场景',
    content: `一位{年龄}的{性别}，{人物描述}，佩戴眼镜，{表情描述}。
场景：{场景描述}
风格：专业医疗说明图，清晰的人物特写，柔和的光线，白色或浅灰色背景`,
    variables: ['年龄', '性别', '人物描述', '表情描述', '场景描述'],
    category: 'general',
    isDefault: true,
  },
  {
    id: 'tpl-fatigue',
    name: '视疲劳场景',
    content: `一位中年人佩戴眼镜，{眼镜位置描述}，表情疲惫难受，{动作描述}。
背景简洁，突出人物表情和眼镜位置。
风格：专业医疗说明图，写实风格`,
    variables: ['眼镜位置描述', '动作描述'],
    category: 'pupil-distance',
    isDefault: true,
  },
  {
    id: 'tpl-elderly',
    name: '老年人场景',
    content: `一位白发老人，佩戴渐进镜片眼镜，{视觉问题描述}，{表情描述}。
场景：{场景描述}
风格：专业医疗说明图，温和的光线`,
    variables: ['视觉问题描述', '表情描述', '场景描述'],
    category: 'fitting-height',
    isDefault: true,
  },
];

// Part 名称映射
export const partNames: Record<string, string> = {
  'pupil-distance': '瞳距偏差',
  'fitting-height': '装配高度',
  'vertex-distance': '镜眼距',
  'pantoscopic-tilt': '倾斜角',
  'face-form-angle': '镜面角',
};
