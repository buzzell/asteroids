const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var audio = new Audio('space.mp3');
var audio2 = new Audio('laser.wav');
audio.volume = 0.05
audio.loop = true


// Player class
// { position {x, y}, velecity: {x, y} }
class Player {
    constructor({ position, velocity }) {
        this.position = position // {x, y}
        this.velocity = velocity // {x, y}
        this.rotation = 0
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
        c.moveTo(this.position.x + 30, this.position.y)
        c.lineTo(this.position.x - 10, this.position.y - 10)
        c.lineTo(this.position.x - 10, this.position.y + 10)
        c.closePath()
        c.strokeStyle = "white"
        c.fillStyle = 'black'
        c.stroke()
        c.fill()
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
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
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
        this.radius = radius
    }
    draw() {
        
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI, false)
        c.closePath()
        c.strokeStyle = 'white'
        c.fillStyle = 'black'
        c.fill()
        c.stroke()
    }

    update() {
        this.draw()
       
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
    }
}


// Create the player 
const player = new Player({
    position: { 
        x: (canvas.width/2), 
        y: (canvas.height/2)
    },
    velocity: { x: 0, y: 0 }
})



// Tracking the state of W, A, D keys
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

// Player animation constants
let PLAYER_SPEED = 3
let PLAYER_ROTATIONAL_SPEED = 0.05
const PLAYER_FRICTION = 0.97

let PROJECTILE_SPEED = 5

const projectiles = []
const asteroids = []

window.setInterval(() => {
    const index = Math.floor(Math.random() * 4)
    let x, y, vx, vy, radius = 50 * Math.random() + 10

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
    console.log(asteroids)
}, 500)


function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

function circleCollision(circ1, circ2){
    const xDiff = circ1.position.x - circ2.position.x
    const yDiff = circ1.position.y - circ2.position.y
    const distance = Math.sqrt( (xDiff ** 2) + (yDiff ** 2) )
    if(distance <= circ1.radius + circ2.radius) {
        return true
    }
    return false
}



// Animation cycle
let animationId
function animate() {
    animationId = window.requestAnimationFrame(animate)

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
                var audio3 = new Audio('hit.wav');
            audio3.volume = 0.05
            audio3.play()
         
            }
        }
        
    }
    
    player.update()


    if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * PLAYER_SPEED
        player.velocity.y = Math.sin(player.rotation) * PLAYER_SPEED
    } else if (!keys.w.pressed) {
        player.velocity.x *= PLAYER_FRICTION
        player.velocity.y *= PLAYER_FRICTION
    }

    if (keys.d.pressed) player.rotation += PLAYER_ROTATIONAL_SPEED
    else if (keys.a.pressed) player.rotation -= PLAYER_ROTATIONAL_SPEED
}



animate()




let shootfired = false
let paused = false

// Keydown listener
window.addEventListener('keydown', (event) => {
    audio.play()
    switch (event.code){
        
        case 'ShiftLeft':
            PLAYER_SPEED = 10
            PROJECTILE_SPEED = 13
        break
        case 'Escape':
            if(paused){
                animate()
                audio.play()
                paused = false
            }else {
                window.cancelAnimationFrame(animationId)
                audio.pause()
                paused = true
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
        case 'Space':
            if(!shootfired){
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + Math.cos(player.rotation) * 30,
                    y: player.position.y + Math.sin(player.rotation) * 30,
                },
                velocity: {
                    x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                    y: Math.sin(player.rotation) * PROJECTILE_SPEED
                }
            }))
            var audio2 = new Audio('laser.wav');
            audio2.volume = 0.1
            audio2.onended = () => {
                audio2 =  null
            }
            audio2.play()
            shootfired = true
     
        }


        break
    }
})

// Keyup listener
window.addEventListener('keyup', (event) => {
    switch (event.code){
        case 'ShiftLeft':
            PLAYER_SPEED = 3
            PROJECTILE_SPEED = 5
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
            shootfired = false
        break
    }
})
