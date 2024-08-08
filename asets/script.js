// * This variable specifies the state of the add and edit module.
let btn_module = "N"

handelBtn_creatPost_And_edite()
function pagLode(lode) {
    if (lode) {
        $("#loading").show("fast")
        $("nav").removeClass("sticky-top")
    } else {
        $("#loading").hide("fast")
        $("nav").addClass("sticky-top")
    }
}
async function get_all_posts(url, oneTurn = false) {
    if (oneTurn) {
        document.querySelector('.posts').innerHTML = "";
        console.log(oneTurn);
    }
    let req = await fetch(url)
    let data = await req.json()

    if (req.ok) {
        for (let ele in data.data) {
            let check_post
            if (localStorage.getItem("token")) {
                let user_loginData = JSON.parse(localStorage.getItem("token"))
                check_post = data.data[ele].author.id == user_loginData.user.id ? `<button class=" btn_edit btn btn-secondary me-4" data-post="${data.data[ele].title},${data.data[ele].body},${""},${data.data[ele].id}" onclick="edit_post(this)">Edit</button>`: ""
            }
            document.querySelector('.posts').innerHTML +=
            `
        <div  class="card card_body bg-body-tertiary mb-3"   >
                    <div id="card_hdr" data-card_id="${data.data[ele].id}" class="d-flex p-2 align-items-center justify-content-between  " >
                    <div class="d-flex align-items-center ">
                    <img src="${data.data[ele].author.profile_image}" width="60px"  alt="" class="rounded-circle d-inline-block m-3 border border-black border-opacity-20" >
                    <h2 class="fs-6 text-capitalize fw-bold">@${data.data[ele].author.name}</h2>
                    </div>
                    ${localStorage.getItem("token") ? check_post : ""}
                    </div>
                    <div id="${data.data[ele].id}" onclick = "postReview(${data.data[ele].id})" >
                    <div class="p-3">
                    <img src="${data.data[ele].image}" height=" 300px"  class="card-img-top object-fit-cover" alt="...">
                    <div class="card-body" style="cursor: pointer;">
                    <p class="card-text"><small class="text-body-secondary">${data.data[ele].created_at}</small></p>
                    <h2>${data.data[ele].title}</h2>
                    <p class="card-text">${data.data[ele].body}</p>
                    </div>
                    <hr>
                    <div>
                    <i class="fa-solid fa-pen fa-fade"></i>
                    <span>(${data.data[ele].comments_count}) comment</span>
                    <span id="tags-${data.data[ele].id}"></span>
                    </div>
                    </div>
                    </div>
                  </div>
        `

            document.querySelector(`#tags-${data.data[ele].id}`).innerHTML = ""
            for (tag of data.data[ele].tags) {
                document.querySelector(`#tags-${data.data[ele].id}`).innerHTML += `
            <span class="btn btn-sm rounded-5 bg-secondary">${tag.name}</span>
            `
            }
        }

        ui_login()
    }
    pagLode(false)
}
let current_page = 2
addEventListener("scroll", _ => {
    if (scrollY >= ((document.body.clientHeight - window.innerHeight))) {
        get_all_posts(`https://tarmeezacademy.com/api/v1/posts?page=${current_page}`)
        ++current_page
    }
})
get_all_posts(`https://tarmeezacademy.com/api/v1/posts`)

// ********* login 
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
    let log = async function () {
        await login("https://tarmeezacademy.com/api/v1/login", e)
        await get_all_posts(`https://tarmeezacademy.com/api/v1/posts`, true)
    }
    log()
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
    get_all_posts(`https://tarmeezacademy.com/api/v1/posts`, true)
    ui_login()
    alert("You have been successfully logged out.", "info")

})
function ui_login() {
    if (localStorage.getItem("token")) {
        $("#login_register").hide();
        $("#signOut").show();
        let user_loginData = JSON.parse(localStorage.getItem("token"))
        // **** nav logo 
        $("#user__img").show();
        $("#user__name").show();
        $("#user__name").html(user_loginData.user.name)
        let btnAdd_newPost = document.createElement("button")
        btnAdd_newPost.onclick = _ => {
            btn_module = "N"
            handelBtn_creatPost_And_edite()
        }
        btnAdd_newPost.type = "button"
        btnAdd_newPost.setAttribute("data-toggle", "modal")
        btnAdd_newPost.setAttribute("data-target", "#content_newPost")
        btnAdd_newPost.setAttribute("data-whatever", "@mdo")
        btnAdd_newPost.classList = "btn z-2 overflow-hidden add_newPost d-flex rounded-circle justify-content-center align-items-center bg-primary"
        btnAdd_newPost.style.cssText = `
            width:60px;
            height:60px;
            position: fixed;
            top: 80%;
            right: 10%;
        `
        btnAdd_newPost.innerHTML = ` <i class="fa-solid bg-primary text-white fa-plus fa-beat fs-1"></i>`
        document.body.append(btnAdd_newPost)
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
// ! ****************** register start ****************
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

async function new_post(post_edit_id) {
    let userData_fromLocal = JSON.parse(localStorage.getItem("token"))
    let postBody = $("#post_pody").val()
    let postTitle = $("#post_title").val()
    let postImg = document.querySelector('#post-user-img').files
    let url = "https://tarmeezacademy.com/api/v1/posts"
    if (btn_module === "N") {
        console.log("NEW POST");
        let formData = new FormData()
        formData.append("title", postTitle)
        if (postImg.length > 0) {
            formData.append("image", postImg[0])
        }
        formData.append("body", postBody)
        axios.post(url, formData, {
            headers: {
                "Authorization": `Bearer ${userData_fromLocal.token}`,
                "Content-Type": 'multipart/form-data'
            }
        })
            .then(response => {
                alert('You have successfully add new post', 'success')
                $("#content_newPost").hide("fast");
                $(".modal-backdrop").hide()
            })
            .catch(error => {
                console.log(error);
                alert(error.response.data.message, 'danger')
            })
    } else {
        url += `/${post_edit_id}`
        let formData = new FormData();
        formData.append("title", postTitle)
        if (postImg.length > 0) {
            formData.append("image", postImg[0])
        }
        formData.append("body", postBody)
        formData.append("_method", "put")
        axios.post(url, formData, {
            headers: {
                "Authorization": `Bearer ${userData_fromLocal.token}`,
                "Content-Type": 'multipart/form-data'
            }
        }).then(response => {
            alert('You have successfully edit the post', 'success')
            $("#content_newPost").hide("fast");
            $(".modal-backdrop").hide()
        })
            .catch(error => {
                console.log(error);
                alert(error.response.data.message, 'danger')
            })
    }

}

function newPost() {
    pagLode(true)
    new Promise((res, rej) => {
        setTimeout(() => {
            new_post()
            res()
        }, 0);
    }).then(_ => {
        return new Promise((res, rej) => {
            get_all_posts(`https://tarmeezacademy.com/api/v1/posts`, true)
            setTimeout(() => {
                res()
            }, 1500);
        })
    }).finally(_ => {
        pagLode(false)
    })
}

const myModal = new bootstrap.Modal('#content_newPost');
const modal = bootstrap.Modal.getInstance('#content_newPost');
function edit_post(btn) {
    btn_module = "E"
    let post_data = btn.dataset.post.split(",")
    let post_title = post_data[0]
    let postbody = post_data[1]
    let post_img = post_data[2]
    let post_id = post_data[3]
    localStorage.setItem("post_edit_id", post_id)
    handelBtn_creatPost_And_edite(post_title, postbody, post_img)
    modal.show();
    $("#modal_close").click(_ => {
        modal.hide()
    })
}

function go_edit_post() {
    pagLode(true)
    new Promise((res, rej) => {
        setTimeout(() => {
            new_post(localStorage.getItem("post_edit_id"))
            res()
        }, 0);
    }).then(_ => {
        return new Promise((res, rej) => {
            setTimeout(() => {
                get_all_posts(`https://tarmeezacademy.com/api/v1/posts`, true)
                modal.hide()
                res()
            }, 1500);
        })
    }).finally(_ => {
        pagLode(false)
    })
}
function handelBtn_creatPost_And_edite(E_title, E_body, E_img) {
    if (btn_module === "N") {
        $("#content_newPost").html(`
                <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header d-flex justify-content-between">
          <h5 class="modal-title text-uppercase" id="exampleModalLabel">new post</h5>
          <button type="button" id="modal_close"
            class="close d-flex justify-content-center align-items-center border-0 fs-4 w-auto h-auto"
            data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body ">

          <div data-mdb-input-init class="form-outline flex-fill mb-2 ">
            <label class="form-label" for="post_title">Post Title</label>
            <input type="text" id="post_title" class="form-control" />
          </div>
          <div class="mb-3">
            <label for="post_pody" class="form-label">Post Body</label>
            <textarea class="form-control" id="post_pody" rows="3"></textarea>
          </div>
          <div class="mb-4">
            <label class="mb-1" for="post-user-img">Choose a picture for your new post</label>
            <input type="file" class="form-control  " id="post-user-img">
          </div>
          <button id="go_newpost" class="btn btn-primary w-100" onclick="newPost()" >Add</button>
        </div>

      </div>
    </div>
            
            `)

    } else {
        $("#content_newPost").html(`
        <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header d-flex justify-content-between">
          <h5 class="modal-title text-uppercase" id="exampleModalLabel">Edit Post</h5>
          <button type="button" id="modal_close"
            class="close d-flex justify-content-center align-items-center border-0 fs-4 w-auto h-auto"
            data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body ">

          <div data-mdb-input-init class="form-outline flex-fill mb-2 ">
            <label class="form-label" for="post_title">Post Title</label>
            <input type="text" id="post_title" class="form-control" value = "${E_title}" />
          </div>
          <div class="mb-3">
            <label for="post_pody" class="form-label">Post Body</label>
            <textarea class="form-control" id="post_pody" rows="3">${E_body}</textarea>
          </div>
          <div class="mb-4">
            <label class="mb-1" for="post-user-img">Choose a picture for your new post</label>
            <input type="file" class="form-control  " id="post-user-img">
          </div>
          <button id="go_newpost" class="btn btn-primary w-100" onclick="go_edit_post()" >Edit</button>


        </div>

      </div>
    </div>
    
    `);
    }
}

function postReview(post_id){
localStorage.setItem("postDetails",post_id)
location.assign("postReview.html")
}


