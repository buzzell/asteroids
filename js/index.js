import {
    circleTriangleCollision,
    circleCollision,
    randomNumber
} from './util.js'

import CONFIG from './config.js'

// Get canvas and set width and height
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Init background music
const bg_music = new Audio('/sounds/bg_music.mp3');
bg_music.volume = 0.05
bg_music.loop = true
bg_music.preload = 'auto'
const game_over_sound = new Audio('/sounds/game_over.mp3');
game_over_sound.volume = 0.1
game_over_sound.preload = 'auto'


// Projectiles and Asteroids arrays
const projectiles = []
const asteroids = []

// Game variables
let player = false
let game_paused = false 
let animation_id = false
let last_render_time = 0
let last_log_time = 0
let info_toggle = false

// Tracking the state of W, A, D, Space, Esc keys
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    },
    esc: {
        pressed: false
    }
}

// Player class
// { position {x, y}, velecity: {x, y} }
class Player {
    constructor({ position, velocity }) {
        this.position = position // {x, y}
        this.velocity = velocity // {x, y}
        this.rotation = 0
        this.image = new Image()
        this.image.src = '../pixel_ship_blue.png'
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        // c.arc(this.position.x, this.position.y, 5, 0, 2*Math.PI, false)
        // c.fillStyle = 'red'
        // c.fill()
        c.beginPath()
        c.moveTo(this.position.x + 16, this.position.y)
        c.lineTo(this.position.x - 15, this.position.y - 15)
        c.lineTo(this.position.x - 15, this.position.y + 15)
        c.closePath()
        if(info_toggle) {
            c.strokeStyle = "red"
            c.stroke()
        }
        c.drawImage(this.image, this.position.x - 16, this.position.y - 16,);
        c.restore()
    }

    update() {
        this.draw()
        if (this.position.x > canvas.width){
            this.position.x = canvas.width
        }else if (this.position.x < 0) {
            this.position.x = 0
        }
        if (this.position.y > canvas.height){
            this.position.y = canvas.height
        }else if (this.position.y < 0) {
            this.position.y = 0
        }

        document.getElementById("starfield").style.left = '-' + (this.position.x * 10) / canvas.width + '%'
        document.getElementById("starfield").style.top = '-' + (this.position.y * 10) / canvas.height + '%'

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
    
        return [
          {
            x: this.position.x + cos * 16 - sin * 0,
            y: this.position.y + sin * 16 + cos * 0,
          },
          {
            x: this.position.x + cos * -15 - sin * 15,
            y: this.position.y + sin * -15 + cos * 15,
          },
          {
            x: this.position.x + cos * -15 - sin * -15,
            y: this.position.y + sin * -15 + cos * -15,
          },
        ]
      }
}

// Projectile class
// { position {x, y}, velecity: {x, y} }
class Projectile {
    constructor({ position, velocity }){
        this.position = position
        this.velocity = velocity
        this.radius = 2
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI, false)
        c.closePath()
        c.fillStyle = 'white'
        c.fill()
        if(info_toggle) {
            c.strokeStyle = "red"
            c.stroke()
        }
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Asteroid class
// { position {x, y}, velecity: {x, y}, radius: INT }
class Asteroid {
    constructor({ position, velocity, radius}){
        this.position = position
        this.velocity = velocity
        this.radius = 35
        this.image = new Image()
        this.image.src = '../asteroid_grey.png'
    }
    draw() {
        
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI, false)
        c.closePath()
        if(info_toggle) {
            c.strokeStyle = "red"
            c.stroke()
        }
        c.drawImage(this.image, this.position.x - 45, this.position.y - 45);
    }

    update() {
        this.draw()
       
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
    }
}


window.setInterval(() => {
    const index = Math.floor(Math.random() * 4)
    let x, y, vx, vy, radius = 35

    switch (index) {
        case 0: //left
            x = 0 - radius
            y = Math.random() * canvas.height
            vx = randomNumber(0, 1)
            vy = randomNumber(-1, 1)
        break
        case 1: //bottom
            x = Math.random() * canvas.width
            y = canvas.height + radius
            vx = randomNumber(-1, 1)
            vy = randomNumber(-1, 0)
        break
        case 2: //right
            x = canvas.width + radius
            y = Math.random() * canvas.height
            vx = randomNumber(-1, 0)
            vy = randomNumber(-1, 1)
        break
        case 3: //top
            x = Math.random() * canvas.width
            y = 0 - radius
            vx = randomNumber(-1, 1)
            vy = randomNumber(0, 1)
        break
    }

    asteroids.push(
        new Asteroid({ 
            position: {
                x,
                y
            }, 
            velocity: {
                x: vx,
                y: vy
            },
            radius
        })
    )
}, 500)






// Animation cycle
function animate() {
    animation_id = window.requestAnimationFrame(animate)

    c.clearRect(0, 0, canvas.width, canvas.height)

    



    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i]
        projectile.update()
        if (projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y + projectile.radius < 0 ||
            projectile.position.y - projectile.radius > canvas.height

        ) {
            projectiles.splice(i, 1)
        }
        
    }
    


    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i]
        asteroid.update()

        if(circleTriangleCollision(asteroid, player.getVertices())){
            window.cancelAnimationFrame(animation_id)
            bg_music.pause()
            game_over_sound.play()
         
        }


        if (asteroid.position.x + asteroid.radius < 0 ||
            asteroid.position.x - asteroid.radius > canvas.width ||
            asteroid.position.y + asteroid.radius < 0 ||
            asteroid.position.y - asteroid.radius > canvas.height

        ) {
            asteroids.splice(i, 1)
        }

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j]
            if (circleCollision(asteroid, projectile)) {
                asteroids.splice(i, 1)
                projectiles.splice(j, 1)
                let explosion = new Audio('/sounds/explosion.mp3');
                explosion.volume = 0.1
                explosion.play()
         
            }
        }
        
    }
    
    player.update()


    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * CONFIG.PLAYER_SPEED
        player.velocity.y = Math.sin(player.rotation) * CONFIG.PLAYER_SPEED
    } else if (!keys.w.pressed) {
        player.velocity.x *= CONFIG.PLAYER_FRICTION
        player.velocity.y *= CONFIG.PLAYER_FRICTION
    }

    if (keys.d.pressed) player.rotation += CONFIG.PLAYER_ROTATIONAL_SPEED
    else if (keys.a.pressed) player.rotation -= CONFIG.PLAYER_ROTATIONAL_SPEED


    log_info()
    last_render_time = Date.now()
    
}


function log_info() {
    if ((Date.now() - last_log_time) > 500 ) {
        const delta_time = Date.now() - last_render_time
        const fps = Math.floor(1000 / delta_time)
        document.getElementById("info").innerHTML = `
            ${fps} fps <br/>
            Δ ${delta_time}ms <br/>
            ${asteroids.length} asteroids <br/>
            ${projectiles.length} projectiles
        `
        last_log_time = Date.now()
    }
}

// Start the Game
function start_game(){
    bg_music.play()
    // Create the player 
    player = new Player({
        position: { 
            x: (canvas.width/2), 
            y: (canvas.height/2)
        },
        velocity: { x: 0, y: 0 }
    })
    animate()
}


window.addEventListener("blur", (event) => {
    if(player && !game_paused) {
        bg_music.pause()
        window.cancelAnimationFrame(animation_id)
        document.getElementById("paused").style.opacity = "1";
        game_paused = true
    }
});


// Window resize listener
window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

// Keydown listener
window.addEventListener('keydown', (event) => {
    if (!player) {
        start_game()
        return
    }
    switch (event.code){
        case 'Escape':
            if(!keys.esc.pressed) {
                if(game_paused){
                    document.getElementById("paused").style.opacity = "0";
                    animate()
                    bg_music.play()
                    game_paused = false
                }else {
                    document.getElementById("paused").style.opacity = "1";
                    window.cancelAnimationFrame(animation_id)
                    bg_music.pause()
                    game_paused = true
                }
                keys.esc.pressed = true
            }
        break
        case 'KeyW':
            keys.w.pressed = true
        break
        case 'KeyA':
            keys.a.pressed = true
        break
        case 'KeyD':
            keys.d.pressed = true
        break
        case 'KeyI':
            if(info_toggle) {
                document.getElementById("info").style.display = "none";
                info_toggle = false
            } else {
                document.getElementById("info").style.display = "block";
                info_toggle = true
            }
        break
        case 'Space':
            if(!keys.space.pressed){
                projectiles.push(new Projectile({
                    position: {
                        x: player.position.x + Math.cos(player.rotation) * 16,
                        y: player.position.y + Math.sin(player.rotation) * 16,
                    },
                    velocity: {
                        x: Math.cos(player.rotation) * CONFIG.PROJECTILE_SPEED,
                        y: Math.sin(player.rotation) * CONFIG.PROJECTILE_SPEED
                    }
                }))
                let laser = new Audio('/sounds/laser.mp3');
                laser.volume = 0.1
                laser.play()
                keys.space.pressed = true
            }
        break
    }
})

// Keyup listener
window.addEventListener('keyup', (event) => {
    switch (event.code){
        case 'Escape':
            keys.esc.pressed = false
        break
        case 'KeyW':
            keys.w.pressed = false
        break
        case 'KeyA':
            keys.a.pressed = false
        break
        case 'KeyD':
            keys.d.pressed = false
        break
        case 'Space':
            keys.space.pressed = false
        break
    }
})
