
//------------------------------------Menu-item-------------------
const toP = document.querySelector(".top")
window.addEventListener("scroll",function(){
    const X = this.pageYOffset;
  if(X>1){toP.classList.add("active")}
  else {
      toP.classList.remove("active")
  }
})
//------------------------------------Menu-SLIDEBAR-CARTEGORY-------------------
const itemSlidebar = document.querySelectorAll(".cartegory-left-li")
itemSlidebar.forEach(function(menu,index){
    menu.addEventListener("click",function(){
        menu.classList.toggle("block")
    })
})
//------------------------------------PRODUCT-------------------
const bigImg = document.querySelector(".product-content-left-big-img img")
const smallImg = document.querySelectorAll(".product-content-left-small-img img")

smallImg.forEach(function(imgItem,X){
    imgItem.addEventListener("click", function(){
        console.log(imgItem)
         bigImg.src = imgItem.src
    })
})

const baoQuan = document.querySelector(".baoquan")
const chiTiet = document.querySelector(".chitiet")
if(baoQuan){
    baoQuan.addEventListener("click",function(){
        document.querySelector(".product-content-right-bottom-content-chitiet").style.display = "none"    
        document.querySelector(".product-content-right-bottom-content-baoquan").style.display = "block"
})
}
if(chiTiet){
    chiTiet.addEventListener("click",function(){
        document.querySelector(".product-content-right-bottom-content-chitiet").style.display = "block"    
        document.querySelector(".product-content-right-bottom-content-baoquan").style.display = "none"
            })
}


const buTton = document.querySelector(".product-content-right-bottom-top")
if(buTton){
    buTton.addEventListener("click",function(){
        document.querySelector(".product-content-right-bottom-content-big").classList.toggle("activeB")
        })
}
const meNuleft = document.querySelectorAll(".admin-content-left > ul > li")
meNuleft.forEach(function(menuitem,index){
    menuitem.addEventListener("click",function(){
        menuitem.classList.toggle("active")    
    })
})

function deleteCategory(categoryId) {
    if (confirm('Danh mục sẽ bị xóa vĩnh viễn, bạn có chắc muốn tiếp tục không?')) {
        fetch(`/danhmuc/${categoryId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                window.location.reload(); // Refresh page after successful delete
            } else {
                console.error('Failed to delete category');
            }
        })
        .catch(error => console.error('Error deleting category:', error));
    }
}
function deleteProducttypelist(id) {
    if (confirm('Are you sure you want to delete this product type?')) {
      fetch(`/deleteProductType/${id}`, {
        method: 'DELETE',
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Product type deleted') {
          location.reload();
        } else {
          alert('Error deleting product type');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error deleting product type');
      });
    }
}
function deleteColor(id) {
    if (confirm('Bạn có chắc chắn muốn xóa màu sắc này?')) {
        fetch(`/color/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Color deleted') {
                window.location.reload(); // Reload the page after deletion
            } else {
                alert('Lỗi xóa màu sắc');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Lỗi xóa màu sắc');
        });
    }
}

function deleteProduct(sanpham_id) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/productdelete/${sanpham_id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Product deleted') {
                location.reload();
            } else {
                alert('Error deleting product');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting product');
        });
    }
}
function deletePhoto(sanpham_anh_id) {
    if (confirm('Are you sure you want to delete this photo?')) {
        fetch(`/productphotodelete/${sanpham_anh_id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Photo deleted') {
                location.reload();
            } else {
                alert('Error deleting photo');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting photo');
        });
    }
}


  
   


