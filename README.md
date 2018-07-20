npm install


在 fabric-samples/fabcar/Fabconn.js 中加入


    /**
     * API
     * 将从客户端接受的文件的base64编码作为一个交易加入区块链
     * 避免在服务器端产生缓存
     * @param {*} key 键值key
     * @param {*} bdata 图片的base64编码
     * @param {*} desc 一个json对象{}，包含一组描述属性，如文件类别，创建修改时间等，这些属性用于多条件检索
     */
    putBase64(key, bdata, desc = '{}') {
        try {
            desc = JSON.parse(desc);
            desc.base64 = bdata;
            let jstr = JSON.stringify(desc);
            this.invoke('put', key, jstr);
        } catch (err) {
            console.log("图片加入失败", err);
        }

    }
    
    

注释掉 fabric-samples/DiplomaManangement/node_modules/raw-body/index.js 中 readStream 中的

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
    
