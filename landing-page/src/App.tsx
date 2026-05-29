import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";

import Home from "@/pages/home";
import Tools from "@/pages/tools";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Reviews from "@/pages/reviews";
import Careers from "@/pages/careers";
import Docs from "@/pages/docs";
import Blog from "@/pages/blog";
import Support from "@/pages/support";
import Faq from "@/pages/faq";
import Partner from "@/pages/partner";
import Guide from "@/pages/guide";
import CEO from "@/pages/ceo";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tools" component={Tools} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/careers" component={Careers} />
      <Route path="/docs" component={Docs} />
      <Route path="/blog" component={Blog} />
      <Route path="/support" component={Support} />
      <Route path="/faq" component={Faq} />
      <Route path="/partner" component={Partner} />
      <Route path="/guide" component={Guide} />
      <Route path="/ceo" component={CEO} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;