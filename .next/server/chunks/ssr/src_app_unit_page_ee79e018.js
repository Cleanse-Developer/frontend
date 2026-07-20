module.exports=[15735,a=>{"use strict";var b=a.i(72131),c=a.i(50944),d=a.i(72229);function e(){let a=(0,c.useRouter)();return(0,b.useEffect)(()=>{d.productApi.getAll({limit:1}).then(b=>{let c=b.products?.[0];c?a.replace(`/unit/${c.slug}`):a.replace("/wardrobe")}).catch(()=>a.replace("/wardrobe"))},[a]),null}a.s(["default",()=>e])}];

//# sourceMappingURL=src_app_unit_page_ee79e018.js.map