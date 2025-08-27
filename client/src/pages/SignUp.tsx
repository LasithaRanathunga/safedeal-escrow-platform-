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

import signinImage from "../assets/signin.png";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmpassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  fullname: z.string().min(1, "Full name is required"),
});

export default function SignUp() {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    fetch("http://localhost:3000/", {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => {
      console.log(res);
    });
  };

  return (
    <div className="flex  justify-center  pt-32 pb-20">
      <div className="w-full  grid lg:grid-cols-2 p-4">
        <div className="max-w-md m-auto w-full flex flex-col items-center">
          <p className="mt-8 text-2xl font-semibold tracking-tight">
            Sign Up for SafeDeal
          </p>
          <p className="mt-4 text-md font-extralight text-center text-muted-foreground">
            Create your account to securely buy, sell, and collaborate through
            milestone-based contracts.
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
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Full Name"
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
              <FormField
                control={form.control}
                name="confirmpassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
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
            Already have an account?
            <Link to="/log-in" className="ml-1 underline text-muted-foreground">
              Log in
            </Link>
          </p>
        </div>
        <div className="bg-transparent hidden lg:block rounded-lg mr-24 h-full relative">
          <img
            src={signinImage}
            alt="signup-image"
            width="600"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}
