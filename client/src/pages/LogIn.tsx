import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import loginImage from "../assets/log-in.jpg";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function LogIn() {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <div className="h-screen flex items-center justify-center pt-16">
      <div className="w-full  grid lg:grid-cols-2 p-4">
        <div className="max-w-md m-auto w-full flex flex-col items-center">
          <Logo size="sm" />
          <p className="mt-8 text-2xl font-semibold tracking-tight">
            Welcome Back to SafeDeal
          </p>
          <p className="mt-4 text-md font-extralight text-center text-muted-foreground">
            Log in to manage your contracts, track progress, and handle payments
            — all in one place.
          </p>

          <div className="my-10 w-full flex items-center justify-center overflow-hidden">
            <Separator />
          </div>

          <Form {...form}>
            <form
              className="w-full space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-4 w-full text-lg cursor-pointer"
              >
                Sign Up
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-md text-center">
            Want to create a new account ?
            <Link
              to="/sign-up"
              className="ml-1 underline text-muted-foreground"
            >
              SignUp
            </Link>
          </p>
        </div>
        <div className="bg-transparent hidden lg:block rounded-lg mr-24 h-full relative">
          <img
            src={loginImage}
            alt="signup-image"
            width="800"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}
