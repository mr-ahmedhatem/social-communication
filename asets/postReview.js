function pagLode(lode) {
    if (lode) {
        $("#loading").show("fast")
        $("nav").removeClass("sticky-top")
    } else {
        $("#loading").hide("fast")
        $("nav").addClass("sticky-top")
    }
}
function ui_login() {
    getPost_details()
    if (localStorage.getItem("token")) {
        $("#login_register").hide();
        $("#signOut").show();
        let user_loginData = JSON.parse(localStorage.getItem("token"))
        // **** nav logo 
        $("#user__img").show();
        $("#user__name").show();
        $("#user__name").html(user_loginData.user.name)
       
        if (user_loginData.user.profile_image.length > 1) {
            document.querySelector("#user__img").src = user_loginData.user.profile_image
        } else {
            document.querySelector("#user__img").src = "./asets/user vector.jpg"
        }
    } else {
        $("#login_register").show();
        $("#signOut").hide();
        $("#user__img").hide();
        $("#user__name").hide();
        $(".add_newPost").remove()
    }
    setTimeout(_ => {
        pagLode(false)
    }, 500)
}
let [userName, userPassword, remember, show_form_log] = [document.querySelector('#user_name'), document.querySelector('#user_Password'), document.querySelector('#checkbox'), document.querySelector('#show_form_log')]
show_form_log.addEventListener("click", _ => {
    if (localStorage.getItem("remember")) {
        let loginFeild_data = JSON.parse(localStorage.getItem("remember"))
        userName.value = loginFeild_data.user_n
        userPassword.value = loginFeild_data.user_p
    }
})
async function login(url, e) {
    pagLode(true)
    if (userName.value.length == 0 && userPassword.value.length == 0) {
        e.preventDefault()
    } else {
        if (remember.checked) {
            localStorage.setItem("remember", JSON.stringify({
                user_n: userName.value,
                user_p: userPassword.value
            }))
        } else {
            localStorage.removeItem("remember")
        }
        let rq = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                username: userName.value,
                password: userPassword.value
            }),
            headers: {
                "Accept": 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(data => {
                pagLode(false)
                if (data.errors) {
                    console.log(data);
                    alert(data.message, 'danger')
                } else {
                    localStorage.setItem("token", JSON.stringify(data))
                    ui_login()
                    alert('You have successfully logged in.', 'success')
                    $("#content_login").hide("fast");
                    $(".modal-backdrop").hide()

                }
            }).catch(error => {
                pagLode(false)
                console.log(error)
            })


    }

}
document.querySelector('#login').addEventListener("click", e => {
    login("https://tarmeezacademy.com/api/v1/login", e)
})


function alert(message, type) {
    const alertPlaceholder = document.querySelector('#alert')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
        setTimeout(_ => {
            alertPlaceholder.innerHTML = ""
        }, 5000)
    }


    appendAlert(message, type)
}
$("#signOut_btn").click(_ => {
    pagLode(true)
    localStorage.removeItem("token")
    ui_login()
    alert("You have been successfully logged out.", "info")

})
ui_login()
let [re_user_password, re_user_name, re_user_userName, re_user_img, re_user_email] = [document.querySelector('#re-user-password'), document.querySelector('#re-user-name'), document.querySelector('#re-user-userName'), document.querySelector('#re-user-img'), document.querySelector('#re-user-email')]
async function register() {
    let url = "https://tarmeezacademy.com/api/v1/register"
    let formData = new FormData()
    formData.append("username", re_user_userName.value)
    formData.append("password", re_user_password.value)
    if (re_user_img.files.length > 0) {
        formData.append("image", re_user_img.files[0]);
    }
    formData.append("name", re_user_name.value)
    formData.append("email", re_user_email.value)

    axios.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
        .then(response => {
            localStorage.setItem("token", JSON.stringify(response.data))
            alert('You have successfully logged in.', 'success')
            $("#content_register").hide("fast");
            $(".modal-backdrop").hide()
            ui_login()
        })
        .catch(error => {
            console.log(error);
            alert(error.response.data.message, 'danger')
        })

}

document.querySelector('#goRegister').addEventListener("click", _ => {
    register()
})
pagLode(false)
function getPost_details(){
    let url = `https://tarmeezacademy.com/api/v1/posts/${localStorage.getItem("postDetails")}`
    axios.get(url)
    .then(response => {
        let result = response.data.data
        console.log(result)
                $("#user__namePost").html(result.author.name)

        document.body.querySelector(".posts").innerHTML = `
        
         <div class="card card_body bg-body-tertiary mb-3" id="${result.id}"  >
        <div class="d-flex p-2 align-items-center " >
            <img src="${result.author.profile_image}" width="60px"  alt="" class="rounded-circle d-inline-block m-3 border border-black border-opacity-20" >
            <h2 class="fs-6 text-capitalize fw-bold">@${result.author.name}</h2>
        </div>
        <div class="p-3">
        <img src="${result.image}" height=" 300px"  class="card-img-top object-fit-cover" alt="...">
        <div class="card-body" style="cursor: pointer;">
        <p class="card-text"><small class="text-body-secondary">${result.created_at}</small></p>
        <h2>${result.title}</h2>
        <p class="card-text">${result.body}</p>
        </div>
        <hr>
        <div>
        <i class="fa-solid fa-pen fa-fade"></i>
        <span>(${result.comments_count}) comment</span>
        <span id="tags-${result.id}"></span>
        
        </div>
        <hr>
        <ul id="comments" class="list-group list-group-flush">

        </ul>
        <div class="input-group my-3">
          <input id="field_comment" type="text" class="form-control" placeholder="add new comment" aria-label="Recipient's username" aria-describedby="basic-addon2">
          <button class="btn btn-primary" id="btn_addComment"   >Add</button>
        </div>
        </div>
      </div>
    </div>
        `
        if (localStorage.getItem("token")) {
            $("#btn_addComment").attr('onclick','addComment(this)')
            $("#btn_addComment").removeClass("opacity-25").css({"cursor": "pointer"})
        }else{
            $("#btn_addComment").attr('onclick','')
            $("#btn_addComment").addClass("opacity-25").css({"cursor": "not-allowed"})
            
        }
        document.querySelector('#comments').innerHTML = ""
    for(let comment of result.comments){
        document.querySelector('#comments').innerHTML += `
            <li class="list-group-item rounded-2">
            <div class="d-flex mb-3 align-items-center">
              <img src="${comment.author.profile_image}" class="border rounded-circle border-danger border-opacity-50" width="60px"  height="60px" alt="">
              <h2 class="fs-5 mx-3 fw-bold">${comment.author.name}</h2>
            </div>
            <p>
            ${comment.body}
            </p>
          </li>
        `
    }
    for(let tag of result.tags){
        document.querySelector(`#tags-${result.id}`).innerHTML += `
        <span class="btn btn-sm rounded-5 bg-secondary" >${tag.name}</span>
        `
    }
    })
    .catch(error => console.log(error))
}
getPost_details()

function addComment(target){
    let userData = JSON.parse(localStorage.getItem("token"))
    let url =  `https://tarmeezacademy.com/api/v1/posts/${localStorage.getItem("postDetails")}/comments`
    let data_field_comment = target.previousElementSibling.value
    axios.post(url,{body : data_field_comment},{
        headers : {
            Authorization: `Bearer ${userData.token}`
        }
    }).then(res => {
        alert( "Comment added successfully", "success")
        setTimeout(getPost_details,200)
    } )
    .catch(error => alert(error.response.data.message,"danger"))
    console.log(data_field_comment);
}
