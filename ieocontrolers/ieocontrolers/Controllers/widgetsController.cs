using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using WebApplication4.Models;

namespace WebApplication4.Controllers
{
    [Authorize]
    public class widgetsController : Controller
    {
        private Admin_visoresEntities db = new Admin_visoresEntities();

        // GET: widgets
        public ActionResult Index()
        {
            var widgets = db.widgets.Include(w => w.Roles);
            return View(widgets.ToList());
        }

        // GET: widgets/Details/5
        public ActionResult Details(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            widgets widgets = db.widgets.Find(id);
            if (widgets == null)
            {
                return HttpNotFound();
            }
            return View(widgets);
        }

        // GET: widgets/Create
        public ActionResult Create()
        {
            ViewBag.min_role = new SelectList(db.Roles, "id", "rol");
            return View();
        }

        // POST: widgets/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "id,min_role")] widgets widgets)
        {
            if (ModelState.IsValid)
            {
                db.widgets.Add(widgets);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.min_role = new SelectList(db.Roles, "id", "rol", widgets.min_role);
            return View(widgets);
        }

        // GET: widgets/Edit/5
        public ActionResult Edit(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            widgets widgets = db.widgets.Find(id);
            if (widgets == null)
            {
                return HttpNotFound();
            }
            ViewBag.min_role = new SelectList(db.Roles, "id", "rol", widgets.min_role);
            return View(widgets);
        }

        // POST: widgets/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "id,min_role")] widgets widgets)
        {
            if (ModelState.IsValid)
            {
                db.Entry(widgets).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.min_role = new SelectList(db.Roles, "id", "rol", widgets.min_role);
            return View(widgets);
        }

        // GET: widgets/Delete/5
        public ActionResult Delete(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            widgets widgets = db.widgets.Find(id);
            if (widgets == null)
            {
                return HttpNotFound();
            }
            return View(widgets);
        }

        // POST: widgets/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(string id)
        {
            widgets widgets = db.widgets.Find(id);
            db.widgets.Remove(widgets);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
