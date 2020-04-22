//index.js
const app = getApp()

const type = 0;
const stores = 1;
const info = 2;

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',

    ischoose: false,
    currentStore: {},
    stores: {}, //存储商家列表
    star:"",
    comments: {}, //评论列表
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    wx.cloud.callFunction({
      name: "searchStore",
      data: {
        userCity: app.globalData.userCity
      },
      success: res=>{
        this.setData({
          stores: res.result.stores
        })
      }
    });
  },

   onChooseStore: function(e){
    
    wx.cloud.callFunction({
      name: "getStoreInfo",
      data: {
        storeId: e.currentTarget.id
      },
      success: res=>{
        var str = "暂无评分";
        if(res.result.storeInfo[0].star!=-1)
          str = "" + res.result.storeInfo[0].star;
        this.setData({
          currentStore: res.result.storeInfo[0],
          comments: res.result.comments,
          star: str,
          ischoose: true
        });
        console.log(this.data.currentStore);
      }
    });
  },

  onBack: function(e){
    this.setData({
      ischoose: false
    });
  },








  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
