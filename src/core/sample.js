// The original sample character shown on first visit and after "reset". Every call returns fresh objects.

/**
 * A fully normalised, original sample character (Korean).
 * @returns {object} CharacterData
 */
export function sampleCharacter() {
  return {
    template: 'fantasy',
    accentColor: '',
    statMode: 'percent',
    name: '솔미르 하늬',
    title: '안개 등대의 파수꾼',
    age: '19',
    gender: '여성',
    race: '해무족',
    role: '등대지기 견습',
    affiliation: '소금안개 군도 항로 조합',
    height: '162cm',
    birthday: '9월 3일',
    quote: '불빛은 길을 비추는 게 아니라, 돌아올 사람을 기다리는 거야.',
    likes: '따뜻한 소금차, 낡은 항해 지도, 새벽 안개 냄새',
    dislikes: '시끄러운 종소리, 약속을 어기는 사람',
    summary: '소금안개 군도의 외딴 등대를 홀로 지키는 견습 등대지기. 안개 속에서 길을 잃은 배들을 불빛과 노래로 이끌며, 사라진 스승이 남긴 마지막 항로를 찾고 있다.',
    backstory: '소금안개 군도에서는 해마다 가을이면 안개가 섬 사이의 길을 지워 버린다. 해무족의 아이로 태어난 솔미르는 어릴 적 안개 속에서 길을 잃었고, 외딴 바위섬 등대의 늙은 등대지기 하늬 할멈에게 구조되었다. 그날 이후 그녀는 등대에 남아 불을 지피는 법과 별자리로 항로를 읽는 법, 그리고 안개를 달래는 노래를 배웠다. 세 해 전 겨울, 스승은 마지막 점검을 하러 떠난 뒤 돌아오지 않았다. 솔미르는 스승이 남긴 낡은 항해 지도 한 장과 꺼지지 않는 등불을 품고 등대를 지키며, 매일 밤 지도에 비어 있는 마지막 항로를 한 줄씩 채워 가고 있다. 언젠가 그 길의 끝에서 스승의 등불과 다시 만나기를 바라면서.',
    tags: ['침착함', '고독한 파수꾼', '길눈 밝음', '노래하는 사람'],
    stats: [
      { label: '힘', percent: 35, score: 7 },
      { label: '민첩', percent: 72, score: 15 },
      { label: '체력', percent: 58, score: 12 },
      { label: '지능', percent: 80, score: 16 },
      { label: '지혜', percent: 90, score: 18 },
      { label: '매력', percent: 66, score: 13 },
    ],
    skills: [
      { name: '등대 점등', desc: '꺼지지 않는 등불로 짙은 안개 속에서도 먼 곳의 배에게 길을 알린다.' },
      { name: '안개 달래기', desc: '노래로 주변의 안개를 잠시 가라앉혀 시야를 열어 준다.' },
      { name: '별자리 항로', desc: '밤하늘의 별자리를 읽어 가장 안전한 항로를 찾아낸다.' },
    ],
    art: { fit: 'cover', focusX: 50, focusY: 30 },
    artUrl: '',
    iconUrl: '',
    sheetWidths: {},
    labels: {},
    hidden: [],
    ...sampleExtras(),
  };
}

/** What a user adds on top of the basic fields: extra items, one custom block, block placement, palette overrides. */
function sampleExtras() {
  return {
    customFields: [
      { id: 'f-lantern', label: '애용품', value: '꺼지지 않는 등불' },
      { id: 'f-motto', label: '좌우명', value: '불빛은 꺼뜨리지 않는다' },
    ],
    customBlocks: [
      {
        id: 'b-diary',
        kind: 'text',
        title: '등대 일지',
        body: '해 질 녘이면 등불 기름부터 채운다.\n안개가 짙은 밤에는 종 대신 노래를 부른다.\n새벽마다 스승의 지도에 항로를 한 줄 보탠다.',
        items: [],
      },
    ],
    layout: {
      info: ['profile', 'quote'],
      main: ['summary', 'stats', 'skills', 'tags', 'likes', 'dislikes', 'backstory', 'b-diary'],
    },
    palettes: {},
  };
}
