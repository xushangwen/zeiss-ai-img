import type { Task, PromptTemplate } from '../types';

// 蔡司任务清单（简化版，不存储图片数据）
export const zeissTasks: Task[] = [
  // Part 1: 瞳距偏差 - 棱镜效应
  {
    id: 'pd-1',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '视疲劳情景图',
    description: '配戴一段时间后，可能出现眼眶周围酸胀，甚至伴有恶心、想吐的感觉。人物皮肤白皙无雀斑，眼镜偏右，眼睛不在镜片光学中心位置，表情难受痛苦，可以揉眼睛或扶额。',
    status: 'pending',
  },
  {
    id: 'pd-2',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '聚焦困难情景图',
    description: '看东西（特别是近处物体）感觉很难聚焦，或者物体边缘有重影。人物皮肤白皙无雀斑，眼镜偏右，眼睛不在镜片光学中心位置，看书或手机时眯眼，表情困惑费力。',
    status: 'pending',
  },
  {
    id: 'pd-3',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '走路不稳情景图',
    description: '走路时感觉地面高低不平，或者下楼梯时判断距离失误。人物皮肤白皙无雀斑，眼镜偏右，眼睛不在镜片光学中心位置，走路扶墙或踉跄，表情不安。',
    status: 'pending',
  },

  // Part 2: 装配高度偏差 - 渐进镜片
  {
    id: 'fh-1',
    part: 'fitting-height',
    partName: '装配高度偏差',
    title: '装配高度偏高',
    description: '看远处模糊，就像眼镜度数不足。人物两鬓有白发显得苍老，眼镜位置偏上，抬头眯眼看远处，表情难受困惑。',
    status: 'pending',
  },
  {
    id: 'fh-2',
    part: 'fitting-height',
    partName: '装配高度偏差',
    title: '装配高度偏低',
    description: '看近处（读书、手机）吃力或看不清，就像老花镜度数不足。人物两鬓有白发显得苍老，眼镜位置偏下，低头费劲看近处，表情疲惫吃力。',
    status: 'pending',
  },

  // Part 3: 镜眼距偏差
  {
    id: 'vd-1',
    part: 'vertex-distance',
    partName: '镜眼距偏差',
    title: '镜眼距过近',
    description: '睫毛会刷到镜片，眨眼时有异物感。人物皮肤白皙，眼镜非常贴近眼睛，睫毛几乎触碰镜片，眨眼时表情不适。',
    status: 'pending',
  },
  {
    id: 'vd-2',
    part: 'vertex-distance',
    partName: '镜眼距偏差',
    title: '镜眼距过远',
    description: '像透过钥匙孔看世界（管状视野），周边视野受限。人物皮肤白皙，眼镜离眼睛很远，视野狭窄，表情困惑不适。',
    status: 'pending',
  },

  // Part 4: 倾斜角偏差
  {
    id: 'pt-1',
    part: 'pantoscopic-tilt',
    partName: '倾斜角偏差',
    title: '倾斜角过小',
    description: '看东西时总觉得模模糊糊、边缘发虚。人物皮肤白皙，眼镜倾斜角度过小（镜片过于垂直），视野边缘模糊，表情困惑。',
    status: 'pending',
  },
  {
    id: 'pt-2',
    part: 'pantoscopic-tilt',
    partName: '倾斜角偏差',
    title: '倾斜角过大',
    description: '镜框下缘容易碰到脸颊，佩戴不舒适。人物皮肤白皙，眼镜倾斜角度过大（镜片过于倾斜），镜框下缘触碰脸颊，表情不适。',
    status: 'pending',
  },

  // Part 5: 镜面角偏差
  {
    id: 'ff-1',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '周边视力模糊',
    description: '平视前方能看清，用余光看两侧时，可能出现变形或模糊。人物皮肤白皙，眼镜镜面角不合适，侧面看东西模糊变形，需要转头才能看清。',
    status: 'pending',
  },
  {
    id: 'ff-2',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '头晕恶心',
    description: '转头时可能出现"晃动感"，出现恶心感。人物皮肤白皙，佩戴眼镜后头晕恶心，表情痛苦难受，可能扶额或捂嘴。',
    status: 'pending',
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
