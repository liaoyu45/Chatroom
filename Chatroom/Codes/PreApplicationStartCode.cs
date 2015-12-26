using System;
using System.IO;
using System.Web;
using System.Web.Routing;
using System.Web.SessionState;

namespace Chatroom {
    public class PhotoHandler : IHttpHandler, IRouteHandler, IRequiresSessionState {

        public static void PreStart() {
            RouteTable.Routes.Add(new Route("photos/{id}/{index}", new PhotoHandler()));
        }

        public bool IsReusable {
            get { return true; }
        }
        static Lazy<string> photosLocalPath = new Lazy<string>(() => HttpContext.Current.Request.MapPath("/photos/"));
        public void ProcessRequest(HttpContext context) {
            var data = context.Request.RequestContext.RouteData;
            int id, index;
            if (!int.TryParse(data.Values["id"] as string, out id) || !int.TryParse(data.Values["index"] as string, out index)) {
                return;
            }
            var iiFile = new IdIndexFile(photosLocalPath.Value, id);
            var filePath = iiFile.GetFile(index);
            if (string.IsNullOrWhiteSpace(filePath)) {
                return;
            }
            context.Response.ContentType = "image/" + filePath.Split('.')[1];
            context.Response.BinaryWrite(File.ReadAllBytes(filePath));
        }

        public IHttpHandler GetHttpHandler(RequestContext requestContext) {
            return this;
        }
    }
}