(() => {
  const DATA = {
    archaeology: {
      eyebrow: 'ARCHAEOLOGY · 考古',
      title: '从地下遗存，重建瓷业城市',
      text: '官方考古资料、发掘时间轴和正式报告入口。重点覆盖御窑厂、湖田窑，以及2024年元明清制瓷业遗址群的系统性发掘。',
      facts: ['1973：珠山东麓发现成化官窑堆积', '2002—2004：御窑厂第一次大规模主动发掘', '2014—2015：第二次大规模主动发掘', '2024：14个遗址点进入集中考古发掘'],
      href: 'research/archaeology/'
    },
    literature: {
      eyebrow: 'LITERATURE · 文献',
      title: '从古籍到论文，全部进入可追溯书目',
      text: '当前 Wiki 已核验的 R01—R35 资料集中展示，并标注全文、在线资料或书目信息。古籍、地方志、考古报告、学术论文和遗产文件分开管理。',
      facts: ['R01—R35：当前完整参考书目', '古籍：景德镇陶录、天工开物、地方志等', '论文：材料、工艺、青白瓷、粉彩、贸易等', '每条资料都保留原始在线入口'],
      href: 'research/literature-library/'
    },
    research: {
      eyebrow: 'RESEARCH · 研究',
      title: '研究，就是把不同证据连起来',
      text: '不用先懂学术术语。这里把研究拆成五条路线：年代与窑业史、材料与技术、器物与审美、贸易与世界交流、遗产与城市。',
      facts: ['考古：告诉我们“发现了什么”', '文献：告诉我们“古人怎么说”', '研究：解释“这些证据意味着什么”', '争议：同时展示不同研究及证据层级'],
      href: 'research/research-hub/'
    },
    heritage: {
      eyebrow: 'WORLD HERITAGE · 世界遗产',
      title: '景德镇手工瓷业遗存 · UNESCO 1765',
      text: '2026年7月25日正式列入《世界遗产名录》。五个组成部分把原料、燃料、生产中心与古窑址串成完整的手工瓷业系统。',
      facts: ['2026：正式列入世界遗产名录', '5个组成部分：镇区、湖田、高岭、长岭、蛟潭', '遗产编号：1765', 'UNESCO提供正式条目、地图、申报文件与管理计划'],
      href: 'research/heritage/'
    }
  };

  const open = (key) => {
    const data = DATA[key];
    if (!data) return;
    let modal = document.getElementById('evidence-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'evidence-modal';
      modal.className = 'evidence-modal';
      modal.innerHTML = '<div class="evidence-modal-backdrop" data-close></div><div class="evidence-modal-card" role="dialog" aria-modal="true" aria-labelledby="evidence-modal-title"><button class="evidence-modal-close" type="button" aria-label="关闭" data-close>×</button><div id="evidence-modal-content"></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }
    const content = modal.querySelector('#evidence-modal-content');
    content.innerHTML = `<p class="evidence-modal-eyebrow">${data.eyebrow}</p><h2 id="evidence-modal-title">${data.title}</h2><p class="evidence-modal-text">${data.text}</p><ul>${data.facts.map(x => `<li>${x}</li>`).join('')}</ul><a class="evidence-modal-primary" href="${data.href}">进入完整资料库 <span>→</span></a>`;
    modal.classList.add('is-open');
    document.body.classList.add('evidence-modal-open');
  };

  const close = () => {
    const modal = document.getElementById('evidence-modal');
    if (modal) modal.classList.remove('is-open');
    document.body.classList.remove('evidence-modal-open');
  };

  const init = () => {
    document.querySelectorAll('.jdm-evidence-card[data-evidence]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        open(card.dataset.evidence);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card.dataset.evidence); }
      });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
