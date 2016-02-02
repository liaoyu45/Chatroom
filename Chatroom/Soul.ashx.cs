using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Chatroom {
    public partial class Soul : PointedMethodHttpHandler {
        private string photoFolder {
            get {
                return HttpContext.Current.Request.MapPath("/photos/");
            }
        }
        const string sessionKey = "current";
        private int lonelyBoy {
            get {
                int result;
                if (!Global.published) {
                    if (this.GetInt("fucker", out result)) {
                        return result;
                    }
                }
                var current = HttpContext.Current.Session[sessionKey] + string.Empty;
                if (int.TryParse(current, out result)) {
                    return result;
                };
                return 0;
            }
            set { HttpContext.Current.Session[sessionKey] = value; }
        }
    }

    public partial class Soul {
        public object Login() {
            if (Global.published) {
                if (this.lonelyBoy > 0) {
                    throw this.RecordError("if (this.id > 0) {");//页面中应检查是否已登录，不应发送此请求。
                }
            }
            var email = this.GetString("email", null);
            var password = this.GetString("password", null);
            using (var factory = new LoveFactory()) {
                var man = factory.Men.FirstOrDefault(m => m.Email == email);
                if (man == null)
                    throw this.RecordError("if (man == null)");
                if (!man.Check(password))
                    throw this.RecordError("if (man.Check(password))");
                man.ActiveTime = DateTime.Now;
                factory.SaveChanges();
                this.lonelyBoy = man.Id;
                return this.GetProtocal();
            }
        }
        public object Register() {
            if (Global.published)
                if (this.lonelyBoy > 0) {
                    throw this.RecordError("if (this.id > 0)");
                }
            var email = this.GetString("email");
            var password = this.GetString("password");
            if (!email.Any() || !password.Any())
                throw this.RecordError("if (!email.Any() || !password.Any())");
            using (var factory = new LoveFactory()) {
                if (factory.Men.Any(m => m.Email == email))
                    throw this.RecordError("if (factory.Men.Any(m => m.Email == email))");
                var man = LY.SameToMe(email, password);
                factory.ManInfos.Add(man);
                factory.SaveChanges();
                this.lonelyBoy = man.Id;
                return this.GetProtocal();
            }
        }
        public object GetProtocal() {
            using (var factory = new LoveFactory()) {
                var man = factory.Men.Find(this.lonelyBoy);
                return new {
                    id = man.Id,
                    key = (int)(man.ActiveTime - man.RegisterTime).TotalMilliseconds
                };
            }
        }
        public string HisName() {
            var him = this.GetInt("him");
            using (var factory = new LoveFactory()) {
                var man = factory.ManInfos.Find(him);
                return man?.Name;
            }
        }
        public object HisData() {
            var him = this.GetInt("him");
            using (var factory = new LoveFactory()) {
                var man = factory.ManInfos.Find(him);
                var current = factory.Men.Find(this.lonelyBoy);
                if ((current.Basterds ?? string.Empty).Split(',', ' ', '.').Contains(him.ToString())) {//TODO:Clients should make sure that this will not happen.
                    return null;
                }
                return new {
                    man.AHWC,
                    man.Filter,
                    man.Introduce,
                    man.RegisterTime,
                    man.Taste,
                };
            }
        }
        public Man MyData() {
            using (var factory = new LoveFactory()) {
                return factory.Men.Find(this.lonelyBoy);
            }
        }
        public void IgnoreHim() {
            var basterd = this.GetInt("basterd");
            using (var f = new LoveFactory()) {
                var man = f.Men.Find(this.lonelyBoy);
                var him = f.Men.Find(basterd);
                if (man.Ignore(basterd)) {
                    f.SaveChanges();
                }
            }
        }
        public void UpdateMyData() {
            int Height, Weight;
            string Charactor, Name, Introduce, Taste, Filter;

            DateTime Birthday;
            if (!DateTime.TryParse(this.GetString("Birthday"), out Birthday)) {
                Birthday = new DateTime(1990, 3, 13);
            }
            this.GetInt("Height", 0x80, 0x100, out Height);
            this.GetInt("Weight", 0x40, 0x100, out Weight);
            Charactor = this.GetString("Charactor");
            if (!new[] { "0", "1", "~", "0.5" }.Contains(Charactor)) {
                Charactor = "~";
            }
            Name = this.GetString("Name");
            Introduce = this.GetString("Introduce");
            Taste = this.GetString("Taste");
            Filter = this.GetString("Filter");
            using (var f = new LoveFactory()) {
                var man = f.ManInfos.Find(this.lonelyBoy);
                man.Birthday = Birthday;
                man.Height = Height;
                man.Weight = Weight;
                man.Charactor = Charactor;
                man.Nickname = Name;
                man.Introduce = Introduce;
                man.Taste = Taste;
                man.Filter = Filter;
                f.SaveChanges();
            }
        }
        public void UploadPhoto() {
            var f = HttpContext.Current.Request.Files["photo"];
            var suffix = f.FileName.Split('.').Last();
            if (!new[] { "jpg", "bmp", "gif", "png" }.Contains(suffix)) {
                throw base.RecordError("上传照片时图片格式错误！");
            }
            var iifile = new IdIndexFile(photoFolder, this.lonelyBoy);
            var path = iifile.NextFileFullPath(f.FileName.Split('.').Last());
            f.SaveAs(path);
        }
        public IEnumerable<string> GetPhotos() {
            int id;
            if (!this.GetInt("id", out id)) {
                id = this.lonelyBoy;
            }
            var iiFile = new IdIndexFile(photoFolder, id);
            return iiFile.Files;
        }
        public void ResetTestData() {
            if (Global.published) {
                return;
            }
            using (var f = new LoveFactory()) {
                f.Database.Delete();
                f.Database.Create();
                f.ManInfos.Add(LY.SameToMe("liaoyu45@163.com", "qwe123"));
                f.ManInfos.Add(LY.SameToMe("dddd@163.com", "qwe123"));
                f.ManInfos.Add(LY.SameToMe("wwww@163.com", "qwe123"));
                f.SaveChanges();
            }
        }
        public void ResetBlackList() {
            using (var f = new LoveFactory()) {
                foreach (var m in f.Men) {
                    m.Basterds = string.Empty;
                }
                f.SaveChanges();
            }
        }
    }
}