/**
 * Design system: «ملاذ هادئ» — تنقل واضح بين مساحة عامة مطمئنة وإدارة عملية محمية.
 */
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import ArticleDetail from "@/pages/ArticleDetail";
import Articles from "@/pages/Articles";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Services from "@/pages/Services";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }), [location]);
  return null;
}

function PublicLayout() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  return (
    <>
      <ScrollToTop />
      {!isAdmin && <SiteHeader />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/articles/:id" component={ArticleDetail} />
        <Route path="/articles" component={Articles} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
      {!isAdmin && <SiteFooter />}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SiteContentProvider>
            <PublicLayout />
            <Toaster richColors position="top-center" />
          </SiteContentProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
