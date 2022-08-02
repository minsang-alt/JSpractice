//[] 웹서버를 띄운다.
//[] 서버에 새로운 메뉴명을 추가될 수 있도록 요청한다.
//[] 서버에 카테고리별 메뉴리스트를 불러온다.
//[] 서버에 메뉴가 수정 할 수있도록 요청한다.
//[] 서버에 메뉴의 품질상태를 toggle 될수있도록 요청한다.
//[] 서버에메뉴가 삭제 될 수있도록 요청한다.

 //fetch('url',option) url에 요청 어떤방식(option)
 
 const $ = (selector) =>document.querySelector(selector);
const store={
  setLocalStorage(menu){
    localStorage.setItem("menu",JSON.stringify(menu));
  },
  getLocalStorage(){
   return JSON.parse(localStorage.getItem("menu"));
  }



}

const BASE_URL = "http://localhost:3000/api";

const MenuApi = {
  async getAllMenuCategory(category){
    const response = await fetch(`${BASE_URL}/category/${category}/menu`);
    return response.json();
   
    
    
  },
  async createMenu(menuName,category){
    const response = await fetch(`${BASE_URL}/category/${category}/menu`,{
      method: "POST",
      headers:{
        "Content-Type":"application/json",
      },
      body: JSON.stringify({name:menuName}),
    });
    if(!response.ok){
      console.error("에러가 발생했습니다.");

    }

  },

  async updateMenu(menuName,category,menuId){
    
    const response = await fetch(`${BASE_URL}/category/${category}/menu/${menuId}`,{
      method: "PUT",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify({name: menuName}),
    }
    );
    if(!response.ok){
      console.error("에러가 발생했습니다.");
    }
    return response.json();
  },

  async toggleSoldOutMenu(category,menuId){
    const response = fetch(`${BASE_URL}/category/${category}/menu/${menuId}/soldout`,
    {
      method: "PUT",
    }
    );
    if(!response.ok){
      console.error("에러가 발생했습니다.");

    }

    
  },

  async deleteMenu(category,menuId){
    const response = await fetch(`${BASE_URL}/category/${category}/menu/${menuId}`,
      {
        method:"DELETE",
      }
    );
    if(!response.ok){
      console.error("에러가 발생했습니다.");
    }
  },

}

function App(){

    this.menu = {
      espresso: [],
      frappuccino: [],
      blended:[],
      teavana:[],
      desert:[],
    
    };
    this.currentCategory = "espresso";



    this.init=async ()=>{
      /*if(store.getLocalStorage()){
        this.menu = store.getLocalStorage();


      }*/
      this.menu[this.currentCategory] = await MenuApi.getAllMenuCategory(this.currentCategory);

      render();
      
    }

    const render =  ()=>{

      const template = this.menu[this.currentCategory].map((item,index)=>{

        return`
      <li data-menu-id="${item.id}" class=" menu-list-item d-flex items-center py-2">
      <span class="w-100 pl-2 menu-name
      ${item.soldOut ? "sold-out" : ""}
      ">${item.name}</span>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
      >
        품절
      </button>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
      >
        수정
      </button>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
      >
        삭제
      </button>
    </li>`
  
      }).join("");
  
    $("#menu-list").innerHTML= template;
  
  
  
  
     updateMenuCount();
    }




    const updateMenuCount = ()=>{
      const menuCount = $("#menu-list").querySelectorAll("li").length;
      $(".menu-count").innerText = `총 ${menuCount} 개`
       
    
    };

    const soldOutMenu = (e)=>{
      const menuId = e.target.closest("li").dataset.menuId;
      this.menu[this.currentCategory][menuId].soldOut = !this.menu[this.currentCategory][menuId].soldOut;
      store.setLocalStorage(this.menu);
      render();

    }

  
    //메뉴 수정,삭제,품절
    $("#menu-list").addEventListener("click",async (e)=>{

      
      if(e.target.classList.contains("menu-edit-button")){
        const menuId = e.target.closest("li").dataset.menuId;

        const $menuName = e.target.closest("li").querySelector(".menu-name");
        
        const updatedMenuName = prompt("메뉴명을 수정하세요",$menuName.innerText);
        
       await MenuApi.updateMenu(updatedMenuName,this.currentCategory,menuId);
        this.menu[this.currentCategory] = await MenuApi.getAllMenuCategory(this.currentCategory);
        //this.menu[this.currentCategory][menuId].name = updatedMenuName;
        //store.setLocalStorage(this.menu);
        //$menuName.innerText= updatedMenuName;
        render();
        return;
      }

      if(e.target.classList.contains("menu-remove-button")){
        if(confirm("정말 삭제하시겠습니까?")){
        const menuId = e.target.closest("li").dataset.menuId;
        await MenuApi.deleteMenu(this.currentCategory,menuId);
        this.menu[this.currentCategory] = await MenuApi.getAllMenuCategory(
          this.currentCategory
        );
          render();

       // this.menu[this.currentCategory].splice(menuId,1);
        //  store.setLocalStorage(this.menu);

         // e.target.closest("li").remove();
         // updateMenuCount();
        }
        return;
      }

      if(e.target.classList.contains("menu-sold-out")){
        soldOutMenu(e);
        return;
      }
    })
   

      //form태그가 전송되는것을 막아준다.
   $("#menu-form").addEventListener("submit",(e)=>{
        e.preventDefault();
    });



    const addMenuName = async()=>{
      if($("#menu-name").value === ""){
        alert("값을 입력해주세요.");
        return;
      }

    const MenuName = $("#menu-name").value;

    await MenuApi.createMenu(MenuName,this.currentCategory);

    
   this.menu[this.currentCategory]= await MenuApi.getAllMenuCategory(this.currentCategory);


    
    render();
    $("#menu-name").value="";
    }
    


    //이건 api아니고 직접 웹로컬스토리지에 저장
    //this.menu[this.currentCategory].push({name: MenuName});
    //store.setLocalStorage(this.menu);
    //$("#menu-name").value = "";

    //render();


  
    

    $("#menu-submit-button").addEventListener("click",()=>{
        addMenuName();
    });

    //메뉴의 이름을 입력받는건
    $("#menu-name").addEventListener("keypress",(e)=>{

        if(e.key==="Enter")
        {
           addMenuName();
        }
    });

    $("nav").addEventListener("click",async (e)=>{
      const isCategoryButton = e.target.classList.contains("cafe-category-name");
      if(isCategoryButton){
          const category = e.target.dataset.categoryName;
          this.currentCategory = category;
          $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
          this.menu[this.currentCategory] = await MenuApi.getAllMenuCategory(this.currentCategory);
          render();
      }

    })
};

const app = new App();
app.init();

