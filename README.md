npm install

注释掉 DiplomaManangement/node_modules/raw-body/index.js 中 readStream 中的

    //取消注释后无法发送太长的request  
    // if (limit !== null && length !== null && length > limit) {
    //   return done(createError(413, 'request entity too large', {
    //     expected: length,
    //     length: length,
    //     limit: limit,
    //     type: 'entity.too.large'
    //   }))
    // }
  
  和

    //取消注释后无法发送太长的request
    // if (limit !== null && received > limit) {
    //   done(createError(413, 'request entity too large', {
    //     limit: limit,
    //     received: received,
    //     type: 'entity.too.large'
    //   }))
    // } else 
    
