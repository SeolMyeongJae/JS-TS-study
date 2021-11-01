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

// 해커뉴스 데이터 요청, false는 동기적으로 처리하하는 옵션
// ajax.open('GET', NEWS_URL, false);

// send 함수를 호출하면 데이터를 가져옴
// ajax.send();

// 데이터는 response에 저장
// console.log(ajax.response);

// JSON 데이터를 객체로 변환
// const newsFeed = JSON.parse(ajax.response);
const newsFeed = getData(NEWS_URL);
// console.log(newsFeed);

// 데이터를 화면에 보여줄 ul 태그 생성
const ul = document.createElement('ul');

// a태크를 클릭했을 때 발생하는 hashchange를 활용하여 어떤 컨텐츠가 선택됐는지 구분
window.addEventListener('hashchange', function () {
  // location은 브라우저에서 주소와 관련된 정보를 제공해주는 객체
  const id = location.hash.substr(1);
  // ajax.open('GET', CONTENT_URL.replace('@id', id), false);
  // ajax.send();

  // const newsContent = JSON.parse(ajax.response);
  const newsContent = getData(CONTENT_URL.replace('@id', id));
  // console.log(newsContent);
  const title = document.createElement('h1');

  title.innerHTML = newsContent.title;
  content.appendChild(title);
});

// 보여줄 데이터를 ul 태그의 자식으로 li 추가
for (let i = 0; i < 10; i++) {
  // DOM API를 직접 사용해서 UI를 구현했을 때 실제 그 구조가 잘 드러나지 않는 문제점이 있다
  // 문자열을 이용해서 UI를 만드는 방식을 통해 개선할 수 있다
  // DOM이 제공하는 innerHTML은 문자열에 HTML태그가 있으면 HTML태그로 자동으로 변환해주는 역할을 한다
  const div = document.createElement('div');
  div.innerHTML = `
    <li>
      <a href="#${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
      </a>
    </li>
  `;

  // firstElementChild라는 속성은 첫번째 자식 요소를 제공해준다
  ul.appendChild(div.firstElementChild);
}

// root 태그의 자식으로 ul 추가
container.appendChild(ul);

container.appendChild(content);
