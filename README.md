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
    


<<<<<<< HEAD
=======
上传大文件的实现我打算改一下。
>>>>>>> a00aa75058a12de37aea4587a351461fb69f98f3

    
