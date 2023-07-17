import {
    circlePolygonCollision,
    circleCollision,
    randomNumber
} from './util.js'

import CONFIG from './config.js'



// Init background music
const bg_music = new Audio('/sounds/bg_music.mp3');
bg_music.volume = 0.05
bg_music.loop = true
bg_music.preload = 'auto'
const game_over_sound = new Audio('/sounds/game_over.mp3');
game_over_sound.volume = 0.1
game_over_sound.preload = 'auto'








// Game class
class Game {
    constructor({ saveData }) {
        // Canvas variables
        this.canvas = document.querySelector('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight

        // Tracking the state of keys
        this.keys = {
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

        // Game variables
        this.saveData = saveData
        this.player = false
        this.paused = false
        this.animation_id = false
        this.last_render_time = 0
        this.last_log_time = 0
        this.last_asteroid_time = 0
        this.info_toggle = false

        // Asteroids & projectiles arrays
        this.asteroids = []
        this.projectiles = []
       



        //
        window.addEventListener('resize', this.resize)
        window.addEventListener("blur", this.blur);
        window.addEventListener('keydown', this.keydown)
        window.addEventListener('keyup', this.keyup)

        
    }
    
    keydown = (e) => {
        if (!this.player) {
            this.start()
            return
        }
        switch (e.code){
            case 'Escape':
                if(!this.keys.esc.pressed) {
                    if(this.paused){
                        document.getElementById("paused").style.opacity = "0";
                        this.animate()
                        bg_music.play()
                        this.paused = false
                    }else {
                        document.getElementById("paused").style.opacity = "1";
                        window.cancelAnimationFrame(this.animation_id)
                        bg_music.pause()
                        this.paused = true
                    }
                    this.keys.esc.pressed = true
                }
            break
            case 'KeyW':
                this.keys.w.pressed = true
            break
            case 'KeyA':
                this.keys.a.pressed = true
            break
            case 'KeyD':
                this.keys.d.pressed = true
            break
            case 'KeyI':
                if(this.info_toggle) {
                    document.getElementById("info").style.display = "none";
                    this.info_toggle = false
                } else {
                    document.getElementById("info").style.display = "block";
                    this.info_toggle = true
                }
            break
            case 'Space':
                if(!this.keys.space.pressed){
                    this.projectiles.push(new Projectile({
                        position: {
                            x: this.player.position.x + Math.cos(this.player.rotation) * 16,
                            y: this.player.position.y + Math.sin(this.player.rotation) * 16,
                        },
                        velocity: {
                            x: Math.cos(this.player.rotation) * CONFIG.PROJECTILE_SPEED,
                            y: Math.sin(this.player.rotation) * CONFIG.PROJECTILE_SPEED
                        },
                        rotation: this.player.rotation
                    }))
                    let laser = new Audio('/sounds/laser.mp3');
                    laser.volume = 0.1
                    laser.play()
                    this.keys.space.pressed = true
                }
            break
        }



    }

    keyup = (e) => {
        switch (e.code){
            case 'Escape':
                this.keys.esc.pressed = false
            break
            case 'KeyW':
                this.keys.w.pressed = false
            break
            case 'KeyA':
                this.keys.a.pressed = false
            break
            case 'KeyD':
                this.keys.d.pressed = false
            break
            case 'Space':
                this.keys.space.pressed = false
            break
        }
    }

    resize = () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        if(this.player && !this.paused) {
            bg_music.pause()
            window.cancelAnimationFrame(this.animation_id)
            document.getElementById("paused").style.opacity = "1";
            this.paused = true
            this.keys.w.pressed = this.keys.a.pressed = this.keys.d.pressed = this.keys.esc.pressed = false
            
        }
    }

    blur = () => {
        if(this.player && !this.paused) {
            bg_music.pause()
            window.cancelAnimationFrame(this.animation_id)
            document.getElementById("paused").style.opacity = "1";
            this.paused = true
            this.keys.w.pressed = this.keys.a.pressed = this.keys.d.pressed = this.keys.esc.pressed = false
            
        }
    }

    animate = () => {
        this.animation_id = window.requestAnimationFrame(this.animate)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i]
            projectile.update()
            if (projectile.position.x + 10 < 0 ||
                projectile.position.x - 10 > this.canvas.width ||
                projectile.position.y + 10 < 0 ||
                projectile.position.y - 10 > this.canvas.height
    
            ) {
                this.projectiles.splice(i, 1)
            }
            
        }

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i]
            asteroid.update()
    
            if(circlePolygonCollision(asteroid, this.player.getVertices())){
                window.cancelAnimationFrame(this.animation_id)
                bg_music.pause()
                game_over_sound.play()
             
            }
    
    
            if (asteroid.position.x + asteroid.radius < 0 ||
                asteroid.position.x - asteroid.radius > this.canvas.width ||
                asteroid.position.y + asteroid.radius < 0 ||
                asteroid.position.y - asteroid.radius > this.canvas.height
    
            ) {
                this.asteroids.splice(i, 1)
            }
    
            for (let j = this.projectiles.length - 1; j >= 0; j--) {
                const projectile = this.projectiles[j]
                if (circlePolygonCollision(asteroid, projectile.getVertices())) {
   
                    this.asteroids.splice(i, 1)
                    this.projectiles.splice(j, 1)
                    let explosion = new Audio('/sounds/explosion.mp3');
                    explosion.volume = 0.1
                    explosion.play()
                    if(asteroid.size == "large"){
                        this.asteroids.push(
                            new Asteroid({ 
                                position: {
                                    x: asteroid.position.x,
                                    y: asteroid.position.y,
                                }, 
                                velocity: {
                                    x: randomNumber(-1, 1),
                                    y: randomNumber(-1, 1)
                                },
                                size: 'tiny'
                            })
                        )
                        this.asteroids.push(
                            new Asteroid({ 
                                position: {
                                    x: asteroid.position.x,
                                    y: asteroid.position.y,
                                }, 
                                velocity: {
                                    x: randomNumber(-1, 1),
                                    y: randomNumber(-1, 1)
                                },
                                size: 'tiny'
                            })
                        )
                        this.asteroids.push(
                            new Asteroid({ 
                                position: {
                                    x: asteroid.position.x,
                                    y: asteroid.position.y,
                                }, 
                                velocity: {
                                    x: randomNumber(-1, 1),
                                    y: randomNumber(-1, 1)
                                },
                                size: 'tiny'
                            })
                        )

                    }
             
                }
            }
            
        }


        if((this.last_render_time - this.last_asteroid_time) > 500){
            const index = Math.floor(Math.random() * 4)
            

            let x, y, vx, vy, radius = 35


            switch (index) {
                case 0: //left
                    x = 0 - radius
                    y = Math.random() * this.canvas.height
                    vx = randomNumber(0, 1)
                    vy = randomNumber(-1, 1)
                break
                case 1: //bottom
                    x = Math.random() * this.canvas.width
                    y = this.canvas.height + radius
                    vx = randomNumber(-1, 1)
                    vy = randomNumber(-1, 0)
                break
                case 2: //right
                    x = this.canvas.width + radius
                    y = Math.random() * this.canvas.height
                    vx = randomNumber(-1, 0)
                    vy = randomNumber(-1, 1)
                break
                case 3: //top
                    x = Math.random() * this.canvas.width
                    y = 0 - radius
                    vx = randomNumber(-1, 1)
                    vy = randomNumber(0, 1)
                break
            }
            this.asteroids.push(
                new Asteroid({ 
                    position: {
                        x,
                        y
                    }, 
                    velocity: {
                        x: vx,
                        y: vy
                    },
                    size: 'large'
                })
            )

            this.last_asteroid_time = Date.now()
        }

        if (this.player.bounce){
            this.player.velocity.x *= CONFIG.PLAYER_FRICTION
            this.player.velocity.y *= CONFIG.PLAYER_FRICTION
        }
        else if (this.keys.w.pressed && !this.player.bounce) {
            this.player.velocity.x = Math.cos(this.player.rotation) * CONFIG.PLAYER_SPEED
            this.player.velocity.y = Math.sin(this.player.rotation) * CONFIG.PLAYER_SPEED
        } else if (!this.keys.w.pressed) {
            this.player.velocity.x *= CONFIG.PLAYER_FRICTION
            this.player.velocity.y *= CONFIG.PLAYER_FRICTION
        }
    
        if (this.keys.d.pressed) this.player.rotation += CONFIG.PLAYER_ROTATIONAL_SPEED
        else if (this.keys.a.pressed) this.player.rotation -= CONFIG.PLAYER_ROTATIONAL_SPEED


        this.player.update()
        this.log_info()
        this.last_render_time = Date.now()
    }

    log_info = () => {
        if ((Date.now() - this.last_log_time) > 500 ) {
            const delta_time = Date.now() - this.last_render_time
            const fps = Math.floor(1000 / delta_time)
            document.getElementById("info").innerHTML = `
                ${fps} fps <br/>
                Δ ${delta_time}ms <br/>
                ${this.asteroids.length} asteroids <br/>
                ${this.projectiles.length} projectiles
            `
            this.last_log_time = Date.now()
        }
    }

    start = () => {
        bg_music.play()
        // Create the player 
        this.player = new Player({
            position: { 
                x: (this.canvas.width/2), 
                y: (this.canvas.height/2)
            },
            velocity: { x: 0, y: 0 }
        })
        this.animate()
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
        this.bounce = false
    }

    draw() {
        game.ctx.save()
        game.ctx.translate(this.position.x, this.position.y)
        game.ctx.rotate(this.rotation)
        game.ctx.translate(-this.position.x, -this.position.y)
        // c.arc(this.position.x, this.position.y, 5, 0, 2*Math.PI, false)
        // c.fillStyle = 'red'
        // c.fill()
        game.ctx.beginPath()
        game.ctx.moveTo(this.position.x + 16, this.position.y)
        game.ctx.lineTo(this.position.x - 15, this.position.y - 15)
        game.ctx.lineTo(this.position.x - 15, this.position.y + 15)
        game.ctx.closePath()
        if(game.info_toggle) {
            game.ctx.strokeStyle = "red"
            game.ctx.stroke()
        }
        game.ctx.drawImage(this.image, this.position.x - 16, this.position.y - 16);
        
        game.ctx.restore()
    }

    update() {
        this.draw()
        if (this.position.x > game.canvas.width - 10 || this.position.x < 0 + 10 || this.position.y > game.canvas.height - 10 || this.position.y < 0 + 10){
            this.bounce = true
            this.velocity.x  = -this.velocity.x
            this.velocity.y  = -this.velocity.y
            window.setTimeout(()=>{
                this.bounce = false
            },250)
        }
    
        document.getElementById("starfield").style.left =  -((this.position.x * 10) / game.canvas.width) + '%'
        document.getElementById("starfield").style.top =  -((this.position.y * 10) / game.canvas.height) + '%'

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
    
        return [
            {
                x: this.position.x + cos * 16 - sin * 0,
                y: this.position.y + sin * 16 + cos * 0
            },
            {
                x: this.position.x + cos * -15 - sin * 15,
                y: this.position.y + sin * -15 + cos * 15
            },
            {
                x: this.position.x + cos * -15 - sin * -15,
                y: this.position.y + sin * -15 + cos * -15
            }
        ]
    }
}

// Projectile class
// { position {x, y}, velecity: {x, y} }
class Projectile {
    constructor({ position, velocity, rotation}){
        this.position = position
        this.velocity = velocity
        this.rotation = rotation
    }

    draw() {

        game.ctx.save()
        game.ctx.translate(this.position.x, this.position.y)
        game.ctx.rotate(this.rotation)
        game.ctx.translate(-this.position.x, -this.position.y)

        game.ctx.beginPath()
        //game.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI, false)
        game.ctx.rect(this.position.x, this.position.y, 10, 2);
        game.ctx.closePath()
        game.ctx.fillStyle = '#a0d9ed'
        game.ctx.fill()
        if(game.info_toggle) {
            game.ctx.strokeStyle = "red"
            game.ctx.stroke()
        }

        game.ctx.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

    getVertices() {
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
    
        return [
            {
                x: this.position.x,
                y: this.position.y
            },
            {
                x: this.position.x + cos * 20 - sin * 0,
                y: this.position.y + sin * 20 + cos * 0,
            },
            {
                x: this.position.x + cos * 20 - sin * -2,
                y: this.position.y + sin * 20 + cos * -2,
            },
            {
                x: this.position.x + cos * 0 - sin * -2,
                y: this.position.y + sin * 0 + cos * -2,
            }
        ]
    }
}

// Asteroid class
// { position {x, y}, velecity: {x, y}, radius: INT }
class Asteroid {
    constructor({ position, velocity, size = 'large'}){
        this.position = position
        this.velocity = velocity
        this.size = size
        if (size == 'large'){
            this.radius = 35
            this.image = new Image()
            this.image.src = '../asteroid_grey.png'
        }else {
            this.radius = 12
            this.image = new Image()
            this.image.src = '../asteroid_grey_tiny.png'
        }

    }
    draw() {
        
        game.ctx.beginPath()
        game.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI, false)
        game.ctx.closePath()
        if(game.info_toggle) {
            game.ctx.strokeStyle = "red"
            game.ctx.stroke()
        }
        if(this.size == 'large'){
            game.ctx.drawImage(this.image, this.position.x - 45, this.position.y - 45);
        } else {
            game.ctx.drawImage(this.image, this.position.x - 15, this.position.y - 15);
        }
        
    }

    update() {
        this.draw()
       
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
    }
}













const game = new Game({
    saveData: {
        score: 4000
    }
})