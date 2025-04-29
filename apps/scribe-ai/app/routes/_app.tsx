import { Box, Flex, Text } from "@radix-ui/themes";
import { Outlet } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import {createSupabaseServerClient} from "../utils/supabase.server";
import DocumentFinder from "../components/documents/document-finder";
import Navigation from "../components/shared/layout/navigation/editor";
import CurrentUser from "../components/account/info/CurrentUser";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient } = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return { env };
};

const AuthLayout = () => {
  return (
    <Flex height={"100%"} flexGrow={"1"} align="stretch" justify="center">
      {/* Two column template */}
      <Flex
        direction="column"
        width="250px"
        minHeight="100vh"
        height="100%"
        position="fixed"
        left="0"
        top="0"
        style={{ borderRight: "1px solid var(--mauve-a5)" }}
      >
        <Flex
          height="100%"
          direction="column"
          justify="between"
          gap="4"
          py={"5"}
          px={"4"}
        >
          <Flex direction="column" gap="4">
            <Text mb="4" weight="bold" size="5">Content Crafter</Text>
            <DocumentFinder />
            <Navigation />
          </Flex>
          <Box>
            <CurrentUser />
          </Box>
        </Flex>
      </Flex>
      <Box
        width="100%"
        height="100%"
        minHeight="100%"
        ml={{
          md: "250px",
        }}
      >
        <Outlet />
      </Box>
    </Flex>
  );
};

export default AuthLayout;
