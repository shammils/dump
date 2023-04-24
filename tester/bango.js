// test numbers
convertIntToKana(num, type) {
  const map = {
    "0":     {kj: '零',        hi: ['れい'], kt: ''},
    "1":     {kj: '一',        hi: ['いち'], kt: ''},
    "2":     {kj: '二',        hi: ['に'], kt: ''},
    "3":     {kj: '三',        hi: ['さん'], kt: ''},
    "4":     {kj: '四',        hi: ['し','よん'], kt: ''},
    "5":     {kj: '伍',        hi: ['ご'], kt: ''},
    "6":     {kj: '六',        hi: ['ろく'], kt: ''},
    "7":     {kj: '七',        hi: ['しち','なな'], kt: ''},
    "8":     {kj: '八',        hi: ['はち'], kt: ''},
    "9":     {kj: '九',        hi: ['きゅう','く'], kt: ''},
    "10":    {kj: '十',        hi: ['じゅう'], kt: ''},
    "100":   {kj: '百',        hi: ['ひゃく','びゃく'], kt: ''},
    "1000":  {kj: ['千','仟'], hi: ['せん'], kt: ''},
    "10000": {kj: '萬',        hi: ["まん","ばん"], kt: ''},
  }
  const gv = (selectedMap) => {
    if (type && type === 'hi') {
      if (selectedMap.hi.length > 1)
        return selectedMap.hi[Math.floor(Math.random() * Math.floor(2))];
      return selectedMap.hi[0];
    }
    return selectedMap.kj;
  };
  const arrayify = (n) => {
    const s = n.toString();
    const arr = [];
    for (let i = 0; i < s.length; i++) arr.push(s[i]);
    return arr;
  }
  const mulch1 = (n) => gv(map[n.toString()]);
  const mulch2 = (n) => {
    if (n === 10) return gv(map[n.toString()]);
    if (n < 20) return `${gv(map['10'])}${gv(map[(n-10).toString()])}`;
    else {
      const chars = arrayify(n);
      return `${gv(map[chars[0]])}${gv(map['10'])}${chars[1] === '0' ? '' : gv(map[chars[1]])}`;
    }
  };
  const mulch3 = (n) => {
    if (n === 100) return gv(map['100']);
    const chars = arrayify(n);
    if (n < 200) {
      if (chars[1] === '0') return `${gv(map['100'])}${mulch1(n-100)}`
      return `${gv(map['100'])}${mulch2(n-100)}`
    }
    if (chars[1] === '0' && chars[2] === '0') return `${gv(map[chars[0]])}${gv(map['100'])}`;
    if (chars[1] === '0') return `${gv(map[chars[0]])}${gv(map['100'])}${gv(map[chars[2]])}`
    const dubs = mulch2(parseInt(`${chars[1]}${chars[2]}`));
    return `${gv(map[chars[0]])}${gv(map['100'])}${dubs}`
  };
  // IN PROGRESS
  const mulch4 = n => {
    if (n === 1000) return gv(map['1000']);
  };
  if (isNaN(num)) {
    log('error', `number ${num} inst a number`)
    return;
  }
  if (num > 999999) {
    log('warn', `bango ${num} wa dekai sugiru`)
    return;
  }
  if (num < 10) { return mulch1(num); }
  if (num > 9 && num < 100) { return mulch2(num); }
  if (num > 99 && num < 1000) { return mulch3(num); }
  if (num > 999 && num < 10000) { return; }
}
