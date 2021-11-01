const container = document.getElementById('root');

// XMLHttpRequest 서버에 데이터 요청
const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';

// title을 클릭했을 때 데이터를 호출할 주소
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// content를 보여줄 div 태그 생성
const content = document.createElement('div');

// 여러 함수가 공유하는 자원을 담을 객체 생성
const store = {
  currentPage: 1,
};

// API 요청하는 중복코드를 함수로 구현
function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

// 라우터 처리를 위해 글 목록을 보여주는 동작을 재사용이 필요하므로 함수로 구현
function newsFeed() {
  const newsFeed = getData(NEWS_URL);
  const newsList = [];
  newsList.push('<ul>');

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
      <li>
        <a href="#/show/${newsFeed[i].id}">
          ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
      </li>
    `);
  }

  newsList.push('</ul>');
  newsList.push(`<div>
    <a href="#/page/${store.currentPage > 1 ? store.currentPage - 1 : 1}">이전 페이지</a>
    <a href="#/page/${
      newsFeed.length / 10 > store.currentPage ? store.currentPage + 1 : store.currentPage
    }">다음 페이지</a>
  </div>`);
  container.innerHTML = newsList.join('');
}

function newsDetail() {
  // location은 브라우저에서 주소와 관련된 정보를 제공해주는 객체
  const id = location.hash.substr(7);
  const newsContent = getData(CONTENT_URL.replace('@id', id));

  // content를 보여주기 전에 이전의 내용을 모두 날리고 content를 화면에 표시
  container.innerHTML = `
    <h1>${newsContent.title}</h1>

    <div>
      <a href="#/page/${store.currentPage}">목록으로</a>
    </div>
  `;
}

function router() {
  const routePath = location.hash;

  if (routePath === '') {
    newsFeed();
  } else if (routePath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routePath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

// a태크를 클릭했을 때 발생하는 hashchange를 활용하여 어떤 컨텐츠가 선택됐는지 구분
window.addEventListener('hashchange', router);

router();
