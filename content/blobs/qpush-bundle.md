## Getting Pushy with Symfony2! ##

Message Queues are not a new concept - neither is Push Notifications and surely not HTTP Posts for that matter. However, when you combine these ideas you have a very flexible queueing system.

Sprinkle in a little bit of Symfony's `EventDispatcher`... suddenly your Symfony application starts to feel a whole lot more responsive. And that feels great.

### The lead up... ###
At [Underground Elephant](http://undergroundelephant.com) we're constantly weighing the benefits of hosting our own services vs using cloud-based alternatives. More often than not, in our fast paced environment - we have bigger fish to fry then dealing with administrating, scaling, and maintaining simple services that, while are important, are not core to our business.

So, when it came to finding ways to increase the responsiveness of our Symfony2 applications and move non-essential processes to the background, we started exploring job queues and messaging.

Admittedly, spinning up an instance of RabbitMQ or ØMQ ain't hard, neither is writing a script that will keep a socket open waiting for new messages.

I guess, frankly, we just didn't want to do it. It was another moving part that my teams had to maintain outside of their applications and more dependencies and infrastructure in our deployment.

### Queue your cake and eat it asynchronously ###

What I wanted was to keep my dependencies light and in code - maintained by [composer](http://getcomposer.org). I wanted a way to write my worker code as simple services within my Symfony application - all maintained within the same repository and deployed just as easily.

I wanted persistence in my queue and a level of failover in case of errors. I wanted hands off scaling and distribution - and I really wanted someone else to manage it.

So, I wanted a lot, actually.

Enter the [Symfony2 QPush Bundle](http://github.com/uecode/qpush-bundle), integrated with [IronMQ](http://www.iron.io/mq).

The bundle integrates push queue providers directly into your Symfony application allowing you to create and manage multiple queues. Subscribers are configurable, allowing differing and/or multiple subscribers per queue.

###### You can publish messages easily... ######

```php
#src/My/Bundle/ExampleBundle/Controller/MyController.php

public function publishAction()
{
    $message = ['foo' => 'bar'];

    // fetch your provider service from the container
    $this->get('uecode_qpush')->get('my_queue_name')->publish($message);
}
```

The bundle leverages the [EventDispatcher](http://symfony.com/doc/current/components/event_dispatcher/index.html) to dispatch a `MessageEvent` when your published messages are received from your queue. Your services are called automatically based on simple tagging which gives a lot of flexibility in chaining services or handling multiple queues in a single service.

Because it utilizes simple services in Symfony, its very easy to reuse your existing code. For us, this made adoption incredibly easy.

###### Handle events in your services ######
```php
#src/My/Bundle/ExampleBundle/Service/ExampleService.php

use Uecode\Bundle\QPushBundle\Event\MessageEvent;
use Uecode\Bundle\QPushBundle\Message\Message;

public function onMessageReceived(MessageEvent $event)
{
    $id         = $event->getMessage()->getId();
    $body       = $event->getMessage()->getBody();
    $metadata   = $event->getMessage()->getMetadata();

    // do some processing
}
```

Check out the bundle and the documentation on [ReadTheDocs](http://qpush-bundle.rtfd.org) for more information on how to incorporate this into your application.

#### Push Queues are awesome. ####

Push Queues may not appeal to everyone or fit each use case, but there is a ton of upside to them.

You know that queue you have that's not heavily utilized, but processing each message as soon as possible is incredibly important? Yeah, the one you're polling on the same 5 second interval at 3am that you are at the heaviest time of day. By pushing notifications directly to you application, you can remove that wasted compute, the wasted api calls, and wasted money.

No more daemon, no more cron.

For PHP specifically, threading has always been a sore spot (read, "non-existent"). However, with Push Queues, you can utilize your web server (Apache, Nginx, etc) to handle the threading for you.
This also means you can easily scale horizontally by either registering more subscribers or utilizing a cluster of web servers behind a load balancer.

#### Wrapping it up ####

The QPush Bundle is open source and openly available to use. We're also very welcome to contributions and feedback. If you have any questions, please visit us on [GitHub](http://github.com/uecode/qpush)!


*Keith Kirk, VP Engineering*
[Underground Elephant](http://undergroundelephant.com)
