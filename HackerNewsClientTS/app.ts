interface Store {
  currentPage: number;
  feeds: NewsFeed[];
}

interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

interface NewsFeed extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean;
}

interface NewsDetail extends News {
  readonly comments: [];
}

interface NewsComment extends News {
  readonly comments: [];
  readonly level: number;
}

const container: HTMLElement | null = document.getElementById('root');

// XMLHttpRequest 서버에 데이터 요청
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';

// title을 클릭했을 때 데이터를 호출할 주소
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// content를 보여줄 div 태그 생성
const content = document.createElement('div');

// 여러 함수가 공유하는 자원을 담을 객체 생성
const store: Store = {
  currentPage: 1,
  feeds: [],
};

// getData함수를 상속 컨셉을 사용해서 수정
class Api {
  // 클래스는 최초에 초기화 과정이 필요하고 그 함수가 constructor라는 생성자다
  url: string;
  ajax: XMLHttpRequest;

  constructor(url: string) {
    // Api를 호출할 때 url, XML인스턴스를 생성하는 과정이 필요함
    this.url = url;
    this.ajax = new XMLHttpRequest();
  }

  protected getRequest<AjaxResponse>(): AjaxResponse {
    this.ajax.open('GET', this.url, false);
    this.ajax.send();

    return JSON.parse(this.ajax.response);
  }
}

class NewsFeedApi extends Api {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewsDetailApi extends Api {
  getData(): NewsDetail[] {
    return this.getRequest<NewsDetail[]>();
  }
}

// API 요청하는 중복코드를 함수로 구현
// getData는 NewsFeed를 반환할수도 있고 NewsDetail을 반환할 수도 있다
// 이런 상황에서 제네릭을 톻해 함수를 호출할 때 유형을 정의해주면 그 유형을 받아서 그대로 반환하겠다는 의미
// function getData<AjaxResponse>(url: string): AjaxResponse {
//   ajax.open('GET', url, false);
//   ajax.send();

//   return JSON.parse(ajax.response);
// }

// 뉴스를 읽었는지 안읽었는지 상태를 가지기 위한 함수
function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

function updateView(html: string): void {
  if (container !== null) {
    container.innerHTML = html;
  } else {
    console.error('최상위 컨테이너가 없어 UI를 전달하지 못합니다.');
  }
}

// 라우터 처리를 위해 글 목록을 보여주는 동작을 재사용이 필요하므로 함수로 구현
function newsFeed(): void {
  const api = new NewsFeedApi(NEWS_URL);
  let newsFeed: NewsFeed[] = store.feeds;
  const newsList = [];
  let template = `
  <div class="bg-gray-600 min-h-screen">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/{{__prev_page__}}" class="text-gray-500">
              Previous
            </a>
            <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
              Next
            </a>
          </div>
        </div> 
      </div>
    </div>
    <div class="p-4 text-2xl text-gray-700">
      {{__news_feed__}}        
    </div>
  </div>
`;

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(api.getData());
  }

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
    <div class="p-6 ${
      newsFeed[i].read ? 'bg-red-500' : 'bg-white'
    } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
    <div class="flex">
      <div class="flex-auto">
        <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
      </div>
      <div class="text-center text-sm">
        <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
      </div>
    </div>
    <div class="flex mt-3">
      <div class="grid grid-cols-3 text-sm text-gray-500">
        <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
        <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
        <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
      </div>  
    </div>
  </div> 
    `);
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? String(store.currentPage - 1) : String(1));
  template = template.replace(
    '{{__next_page__}}',
    newsFeed.length / 10 > store.currentPage ? String(store.currentPage + 1) : String(store.currentPage)
  );

  updateView(template);
}

function newsDetail(): void {
  // location은 브라우저에서 주소와 관련된 정보를 제공해주는 객체
  const id = location.hash.substr(7);
  const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
  const newsContent = api.getData();

  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

// content의 댓글, 대댓글을 보여주는 함수
function makeComment(comments: NewsComment[]): string {
  const commentString = [];

  for (let i = 0; i < comments.length; i++) {
    const comment: NewsComment = comments[i];
    commentString.push(`
      <div style="padding-left: ${comment.level * 40}px ;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${comment.user}</strong> ${comment.time_ago}
        </div>
        <p class="text-gray-700">${comment.content}</p>
      </div>      
    `);

    if (comments[i].comments.length > 0) {
      commentString.push(makeComment(comments[i].comments));
    }
  }

  return commentString.join('');
}

function router(): void {
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
