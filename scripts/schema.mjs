// 各专题 section 结构的唯一事实源：catalog.json 里的 sections 覆盖，否则回落到默认（经典人文八段式）。
export const DEFAULT_SECTIONS = [
  { key: 'original', label: '01 原文' },
  { key: 'explanation', label: '02 逐句白话' },
  { key: 'coreIdea', label: '03 核心思想' },
  { key: 'connections', label: '04 关联知识' },
  { key: 'applications', label: '05 现实映射' },
  { key: 'reflection', label: '06 今日思考' },
  { key: 'questions', label: '07 知识验收' },
  { key: 'mastery', label: '08 掌握标准' },
];

export const sectionsOf = track => (track.sections ?? DEFAULT_SECTIONS).map(({ key, label }) => [key, label]);

export const sectionKeysOf = track => sectionsOf(track).map(([key]) => key);

// 只有显式声明 leadKey 的专题，其对应 section 才套用「原文」大字号样式（如经典类）。
export const leadKeyOf = track => track.leadKey;
