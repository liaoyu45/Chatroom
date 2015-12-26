using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace System {
    public class IdIndexFile {
        private int id;
        private string folder;
        private string prenameFormat;
        private string fullPathFormat = "{0}/{1}.{2}";
        private string[] suffixes;
        public IdIndexFile(string folder, int id)
            : this(folder, id, "{0}_{1}", "jpg", "png", "bmp", "jpeg", "gif") {
        }
        public IdIndexFile(string folder, int id, string prenameFormat, params string[] suffixes) {
            this.folder = folder;
            this.id = id;
            this.prenameFormat = prenameFormat ?? string.Empty;
            if (suffixes.Any()) {
                this.suffixes = suffixes;
            } else {
                this.suffixes = new[] { "jpg", "png", "bmp", "jpeg", "gif" };
            }
            if (this.prenameFormat.IndexOf("{0}") < 0 || this.prenameFormat.IndexOf("{1}") < 1) {
                throw new FormatException("Format of parameter(prenameFormat) is illigal.");
            }
        }
        public int GetCount() {
            var result = 0;
            for (int i = 0; ; i++) {
                var find = this.getFiles(i).FirstOrDefault(p => File.Exists(p));
                if (find != null) {
                    result++;
                } else {
                    return result;
                }
            }
        }
        public string GetFile(int index) {
            var find = this.getFiles(index).FirstOrDefault(p => File.Exists(p));
            return find;
        }
        public IEnumerable<string> Files {
            get {
                var result = new List<string>();
                for (int i = 0; ; i++) {
                    var find = this.getFiles(i).FirstOrDefault(p => File.Exists(p));
                    if (find != null) {
                        result.Add(find.Split('/', '\\').Last());
                    } else {
                        return result;
                    }
                }
            }
        }
        private IEnumerable<string> getFiles(int index) {
            var prename = string.Format(this.prenameFormat, this.id, index);
            foreach (var suffix in this.suffixes) {
                yield return string.Format(this.fullPathFormat, this.folder, prename, suffix);
            }
        }
        public string NextFilePrename {
            get {
                for (int i = 0; ; i++) {
                    var allFiles = this.getFiles(i);
                    var r = allFiles.Any(f => File.Exists(f));
                    if (r) {
                        continue;
                    }
                    return string.Format(this.prenameFormat, this.id, i);
                }
            }
        }
        public string NextFileFullPath(string suffix) {
            var path = string.Format(this.fullPathFormat, this.folder, this.NextFilePrename, suffix);
            return path;
        }
        public void AddFile(string suffix, byte[] bytes) {
            var path = string.Format(this.fullPathFormat, this.folder, this.NextFilePrename, suffix);
            File.WriteAllBytes(path, bytes);
        }
        public bool DeleteFile(int index) {
            var files = this.getFiles(index).Where(p => File.Exists(p));
            if (!files.Any()) {
                return true;
            }
            string deleted = null;
            foreach (var p in files) {
                try {
                    deleted = p;
                    File.Delete(p);
                } catch (Exception) {
                    return false;
                }
            }
            var allfiles = patternsFUCK(this.folder, this.suffixes).Select(p => p.Split('/', '\\').Last());
            var pattern = string.Format(this.prenameFormat, this.id, @"\d+\.");
            var belongings = allfiles.Where(f => Regex.IsMatch(f, pattern));
            if (!belongings.Any()) {
                return true;
            }
            try {
                File.Move(this.folder + '/' + belongings.OrderBy(f => f).Last(), deleted);
            } catch (Exception) {
                return false;
            }
            return true;
        }
        private IEnumerable<string> patternsFUCK(string path, params string[] patterns) {
            return patterns.SelectMany(p => Directory.EnumerateFiles(path, "*." + p));
        }
    }
}
