const container = document.getElementById('root');

// XMLHttpRequest 서버에 데이터 요청
const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';

// title을 클릭했을 때 데이터를 호출할 주소
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// content를 보여줄 div 태그 생성
const content = document.createElement('div');

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

  for (let i = 0; i < 10; i++) {
    // DOM API를 직접 사용해서 UI를 구현했을 때 실제 그 구조가 잘 드러나지 않는 문제점이 있다
    // 문자열을 이용해서 UI를 만드는 방식을 통해 개선할 수 있다
    // DOM이 제공하는 innerHTML은 문자열에 HTML태그가 있으면 HTML태그로 자동으로 변환해주는 역할을 한다
    newsList.push(`
      <li>
        <a href="#${newsFeed[i].id}">
          ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
      </li>
    `);
  }

  newsList.push('</ul>');
  container.innerHTML = newsList.join('');
}

function newsDetail() {
  // location은 브라우저에서 주소와 관련된 정보를 제공해주는 객체
  const id = location.hash.substr(1);
  const newsContent = getData(CONTENT_URL.replace('@id', id));
  const title = document.createElement('h1');

  // content를 보여주기 전에 이전의 내용을 모두 날리고 content를 화면에 표시
  container.innerHTML = `
    <h1>${newsContent.title}</h1>

    <div>
      <a href="#">목록으로</a>
    </div>
  `;
}

function router() {
  const routePath = location.hash;

  if (routePath === '') {
    newsFeed();
  } else {
    newsDetail();
  }
}

// a태크를 클릭했을 때 발생하는 hashchange를 활용하여 어떤 컨텐츠가 선택됐는지 구분
window.addEventListener('hashchange', router);

router();
