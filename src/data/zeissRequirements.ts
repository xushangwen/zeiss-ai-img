import type { Task, PromptTemplate } from '../types';

// 蔡司任务清单 — 严格按照 PDF 黄色标注的配图需求（共 13 项）
export const zeissTasks: Task[] = [
  // ═══ Part 1: 瞳距偏差 - 棱镜效应（4 张）═══
  // 人物1：皮肤白皙无雀斑，眼镜整体偏右，瞳孔不在镜片光学中心
  {
    id: 'pd-1',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '棱镜效应示意图',
    description: '一位年轻人正面特写，佩戴一副眼镜，眼镜整体向右偏移，使得双眼瞳孔明显不在镜片的光学中心位置。镜片光学中心与瞳孔之间存在可见的偏差。人物表情平静，正面面对镜头，重点展示眼镜偏位的状态。',
    status: 'pending',
  },
  {
    id: 'pd-2',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '视疲劳情景图',
    description: '一位年轻人长时间佩戴瞳距不合适的眼镜后感到眼眶周围酸胀、恶心想吐。眼镜整体偏右，瞳孔不在镜片光学中心。人物用手指按压太阳穴（手在眼镜外侧，不遮挡眼镜），紧闭双眼，眉头紧锁，表情非常痛苦难受。',
    status: 'pending',
  },
  {
    id: 'pd-3',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '聚焦困难情景图',
    description: '一位年轻人佩戴瞳距不合适的眼镜尝试阅读手中的书本，但无法聚焦。眼镜整体偏右，瞳孔不在镜片光学中心。人物眯着眼睛费力地盯着书本，表情困惑吃力，仿佛看到的文字边缘有重影。',
    status: 'pending',
  },
  {
    id: 'pd-4',
    part: 'pupil-distance',
    partName: '瞳距偏差',
    title: '走路不稳情景图',
    description: '一位年轻人佩戴瞳距不合适的眼镜走路时感觉地面高低不平。眼镜整体偏右，瞳孔不在镜片光学中心。人物一只手扶着墙壁或扶手保持平衡，脚步踉跄，表情紧张不安，仿佛随时可能摔倒。',
    status: 'pending',
  },

  // ═══ Part 2: 装配高度偏差 - 渐进镜片（3 张）═══
  // 人物2：两鬓多些白发、显得苍老，佩戴渐进镜片
  {
    id: 'fh-1',
    part: 'fitting-height',
    partName: '装配高度偏差',
    title: '瞳高线偏差示意图',
    description: '一位两鬓花白的中老年人正面特写，佩戴一副渐进镜片眼镜。眼镜的装配高度明显不正确，瞳高线的起点偏离了瞳孔中心。人物表情平静，正面面对镜头，重点展示眼镜装配高度偏差的状态。',
    status: 'pending',
  },
  {
    id: 'fh-2',
    part: 'fitting-height',
    partName: '装配高度偏差',
    title: '装配高度偏高（看远模糊）',
    description: '一位两鬓花白的中老年人佩戴装配高度偏高的渐进眼镜，抬头试图看清远处的风景（如远处的山峦或行驶中的汽车），但视线模糊看不清。眼镜位置偏上，人物眯眼费力，表情困惑难受。',
    status: 'pending',
  },
  {
    id: 'fh-3',
    part: 'fitting-height',
    partName: '装配高度偏差',
    title: '装配高度偏低（看近吃力）',
    description: '一位两鬓花白的中老年人佩戴装配高度偏低的渐进眼镜，低头试图阅读手中的书本或手机，但看不清近处的文字。眼镜位置偏下，人物低头费力眯眼，表情疲惫吃力，像老花镜度数不足。',
    status: 'pending',
  },

  // ═══ Part 3: 镜眼距偏差（1 张）═══
  {
    id: 'vd-1',
    part: 'vertex-distance',
    partName: '镜眼距偏差',
    title: '镜眼距过近示意图',
    description: '一位佩戴眼镜的人物面部特写，眼镜非常贴近面部，镜片几乎紧贴眼睛。人物的睫毛明显在刷到镜片内表面，眨眼时能看到睫毛与镜片之间的摩擦接触。表情微微不适，强调眼镜离面部太近造成的物理接触问题。',
    status: 'pending',
  },

  // ═══ Part 4: 倾斜角偏差（1 张）═══
  {
    id: 'pt-1',
    part: 'pantoscopic-tilt',
    partName: '倾斜角偏差',
    title: '倾斜角偏差示意图',
    description: '一位佩戴眼镜的人物侧面或四分之三角度特写。眼镜镜片明显向外倾斜（倾斜角过大或过小），镜片不是正常的微微前倾状态，而是接近垂直或过度倾斜。侧面视角清晰展示镜片与面部之间的异常倾斜角度。',
    status: 'pending',
  },

  // ═══ Part 5: 镜面角偏差（4 张）═══
  {
    id: 'ff-1',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '周边模糊变形图（一）',
    description: '一位佩戴眼镜的人物平视前方，但眼睛余光向左侧斜视。透过镜片边缘区域看到的左侧景物出现明显的变形和模糊。人物表情困惑，试图用余光看清左侧事物却无法看清，不得不转头。',
    status: 'pending',
  },
  {
    id: 'ff-2',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '周边模糊变形图（二）',
    description: '一位佩戴眼镜的人物平视前方，但眼睛余光向右侧斜视。透过镜片边缘区域看到的右侧景物出现明显的变形和模糊。人物表情无奈，需要频繁转头才能看清两侧的事物。',
    status: 'pending',
  },
  {
    id: 'ff-3',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '晃动头晕情景图',
    description: '一位佩戴眼镜的人物正在转头的瞬间感到强烈的眩晕和恶心。人物一只手扶住额头（手在眼镜上方，不遮挡眼镜），另一只手捂住嘴巴（手在眼镜下方），表情非常痛苦，仿佛世界在旋转。',
    status: 'pending',
  },
  {
    id: 'ff-4',
    part: 'face-form-angle',
    partName: '镜面角偏差',
    title: '镜面角示意图',
    description: '一位佩戴眼镜的人物正面特写。眼镜的两个镜片明显向内弯曲，形成一个夸张的弧形夹角（镜面角偏差过大）。从正面可以清晰看到两个镜片不是正常的微弧状，而是形成了很大的内弯弧度。',
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
