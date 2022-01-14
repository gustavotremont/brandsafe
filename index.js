/****************** Nodejs Dependencies ******************/
const express = require('express')
const logger = require('morgan');

const { sequelize, Users, Assets } = require('./models')

/****************** Enable Express ******************/
const app = express()
const port = 3000

/****************** Express Settings ******************/
app.use(express.json()); //Para habilitar envio de JSON al servidor
app.use(express.static('public')); //Habilitar los archivos para que sean estaticos
app.use(express.urlencoded( { extended: false } )); //Habilita la lectura del body por metodo post
app.use(logger('dev')) // habilitar Morgan con preset dev

// SELECT * FROM ...
app.get('/api/users', async (req, res) => {
    const result = await Users.findAll({ attributes:{ exclude: ['id', 'createdAt', 'updatedAt', 'password'] } })
    res.status(200).json(result)
} )

// SELECT * FROM ... WHERE ...
app.get('/api/users/:uuid', async (req, res) => {
    const result = await Users.findOne({ 
        where: { 
            uuid: req.params.uuid
        },
        attributes:{ exclude: ['id', 'createdAt', 'updatedAt', 'password'] },
        include: {
          association: 'assets',
          attributes: ['emails', 'domains', 'images']
        }
    })
    res.status(200).json(result)
} )

// INSERT ...
app.post('/api/users', async (req, res) => {
    try {
        const { email, password, name, address, cif } = req.body
        const result = await Users.create({ email, password, name, address, cif })
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)
    }
    
} )

// DELETE FROM ...
// app.delete('/api/users/:uuid', async (req, res) => {
//     try {
//         const user = await Users.findOne({ 
//             where: { 
//                 uuid: req.params.uuid
//             }
//         })
//         await user.destroy();
//         return res.res(200).json({ msg: 'usuario eliminado' });

//     } catch (error) {
//         res.status(500).json(error)
//     }
    
// } )

//UPDATE ...
app.put('/api/users/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const { email, password, name, address, cif } = req.body;

    try {
        const user = await Users.findOne({ where: { uuid } });

        user.email = email
        user.password = password
        user.name = name
        user.address = address
        user.cif = cif

        await user.save()
        return res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
} )


app.post('/api/assets', async (req, res) => {
    try {
        const { userUUID } = req.query
        const { domains, emails, images } = req.body

        const user = await Users.findOne({ where: { uuid: userUUID } });

        const assets = await Assets.create({ domains, emails, images, userId: user.id })
        res.status(200).json(assets)
    } catch (error) {
        res.status(500).json(error)
    }
    
} )

app.get('/api/assets', async (req, res) => {
    try {
        const assets = await Assets.findAll({ 
            attributes:{ exclude: ['id', 'createdAt', 'updatedAt'] }
        })
        res.status(200).json(assets)
    } catch (error) {
        res.status(500).json(error)
    }
    
} )

app.get('/api/assets/:uuid', async (req, res) => {
    try {
        const {uuid} = req.params
        const asset = await Assets.findOne({ 
            where: { uuid },
            attributes:{ exclude: ['id', 'createdAt', 'updatedAt'] }
        })
        res.status(200).json(asset)
    } catch (error) {
        res.status(500).json(error)
    }
    
} )

/****************** Actice Server ******************/
app.listen(port, async () => {
    console.log(`ServerOn http://localhost:${port}`)
    await sequelize.authenticate()
    console.log('Database Connected');
})